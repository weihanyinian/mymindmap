import { MindMap } from '../models/MindMap';
import type { IMindMapNode } from '@mindflow/shared';
import { nanoid } from 'nanoid';
import JSZip from 'jszip';

function assignNewIds(node: IMindMapNode): IMindMapNode {
  return {
    ...node,
    id: nanoid(8),
    children: node.children.map(assignNewIds),
  };
}

export async function importFromJSON(
  userId: string,
  data: { title?: string; rootNode?: IMindMapNode; theme?: string }
) {
  if (!data.rootNode) {
    throw Object.assign(new Error('Invalid format: missing rootNode'), {
      statusCode: 400,
      code: 'INVALID_FORMAT',
    });
  }

  const rootNode = assignNewIds(data.rootNode);

  const map = await MindMap.create({
    userId,
    title: data.title || 'Imported Mind Map',
    rootNode,
    theme: data.theme || 'default',
  });

  return map.toJSON();
}

export async function importFromXMind(userId: string, buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);

  // Try XMind 2020+ JSON format first
  const contentJson = zip.file('content.json');
  if (contentJson) {
    const text = await contentJson.async('text');
    const parsed = JSON.parse(text);

    // Map XMind JSON structure to our format
    const rootNode = xmindToInternal(parsed[0]?.rootTopic || parsed[0]);
    const title = parsed[0]?.title || 'Imported from XMind';

    const map = await MindMap.create({
      userId,
      title,
      rootNode: assignNewIds(rootNode),
      theme: 'default',
    });

    return map.toJSON();
  }

  // Try XMind 8 XML format
  const contentXml = zip.file('content.xml');
  if (contentXml) {
    const text = await contentXml.async('text');
    // Basic XML parsing for XMind 8
    const rootNode = parseXMind8XML(text);
    const map = await MindMap.create({
      userId,
      title: 'Imported from XMind 8',
      rootNode: assignNewIds(rootNode),
      theme: 'default',
    });

    return map.toJSON();
  }

  throw Object.assign(new Error('Unsupported XMind format'), {
    statusCode: 400,
    code: 'INVALID_FORMAT',
  });
}

function xmindToInternal(xmindTopic: Record<string, unknown>): IMindMapNode {
  const children = (xmindTopic.children as Record<string, unknown>)?.attached || [];
  return {
    id: nanoid(8),
    title: (xmindTopic.title as string) || 'Untitled',
    children: Array.isArray(children)
      ? children.map((child: Record<string, unknown>) => xmindToInternal(child))
      : [],
    position: { x: 0, y: 0 },
    style: {
      fillColor: '#FFFFFF',
      strokeColor: '#4A90D9',
      fontColor: '#333333',
      fontSize: 14,
      shape: 'rounded',
      lineType: 'curve',
      lineColor: '#B0BEC5',
      lineWidth: 2,
    },
    collapsed: false,
    notes: '',
    labels: [],
    icons: [],
  };
}

function parseXMind8XML(xml: string): IMindMapNode {
  // Simple regex-based parser for XMind 8 content.xml
  const topicRegex = /<topic[^>]*id="([^"]*)"[^>]*>/g;
  const titleRegex = /<title>([^<]*)<\/title>/g;
  const childTopics: Record<string, string[]> = {};

  // Extract child relationships
  let match;
  while ((match = topicRegex.exec(xml)) !== null) {
    const id = match[1];
    childTopics[id] = [];
  }

  // Extract titles and build basic tree
  const titleMatch = xml.match(/<title>([^<]*)<\/title>/);
  const rootTitle = titleMatch ? titleMatch[1] : 'Imported';

  return {
    id: nanoid(8),
    title: rootTitle,
    children: [],
    position: { x: 0, y: 0 },
    style: {
      fillColor: '#FFFFFF',
      strokeColor: '#4A90D9',
      fontColor: '#333333',
      fontSize: 14,
      shape: 'rounded',
      lineType: 'curve',
      lineColor: '#B0BEC5',
      lineWidth: 2,
    },
    collapsed: false,
    notes: '',
    labels: [],
    icons: [],
  };
}
