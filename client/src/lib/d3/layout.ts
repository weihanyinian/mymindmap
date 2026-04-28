import { hierarchy, tree } from 'd3-hierarchy';
import type { HierarchyNode } from 'd3-hierarchy';
import type { IMindMapNode } from '@mindflow/shared';

export interface LayoutOptions {
  nodeWidth: number;
  nodeHeight: number;
  horizontalGap: number;
  verticalGap: number;
}

export interface LayoutNode extends HierarchyNode<IMindMapNode> {
  x: number;
  y: number;
  textWidth: number;
}

/** Estimate the pixel width of a text string rendered at a given font size */
export function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (
      (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified
      (code >= 0x3000 && code <= 0x303f) || // CJK Punctuation
      (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
      (code >= 0xff00 && code <= 0xffef) || // Fullwidth
      (code >= 0xac00 && code <= 0xd7af)    // Hangul
    ) {
      width += fontSize; // CJK chars are roughly square
    } else if (ch === ' ') {
      width += fontSize * 0.3;
    } else {
      width += fontSize * 0.55; // Latin/ASCII average
    }
  }
  // Add padding for node interior
  const padded = width + 28;
  return Math.max(80, Math.min(320, padded));
}

const DEFAULT_OPTIONS: LayoutOptions = {
  nodeWidth: 160,
  nodeHeight: 36,
  horizontalGap: 60,
  verticalGap: 8,
};

export function computeLayout(
  rootData: IMindMapNode,
  options: LayoutOptions = DEFAULT_OPTIONS
): LayoutNode {
  // Only include visible (non-collapsed) nodes
  function filterVisible(node: IMindMapNode): IMindMapNode {
    return {
      ...node,
      children: node.collapsed ? [] : node.children.map(filterVisible),
    };
  }

  const visibleRoot = filterVisible(rootData);
  const root = hierarchy<IMindMapNode>(visibleRoot);

  const layout = tree<IMindMapNode>()
    .nodeSize([options.nodeHeight + options.verticalGap, options.nodeWidth + options.horizontalGap])
    .separation((a, b) => {
      if (a.parent === b.parent) return 1.2;
      return 2;
    });

  layout(root);

  // Swap x/y for horizontal (right-oriented) layout
  root.each((node) => {
    const temp = node.x;
    node.x = node.y;
    node.y = temp;
    // Compute per-node text width
    const lNode = node as LayoutNode;
    lNode.textWidth = estimateTextWidth(lNode.data.title, lNode.data.style.fontSize);
  });

  return root as LayoutNode;
}
