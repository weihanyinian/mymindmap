import type { IMindMapNode } from '@mindflow/shared';

export function toMarkdown(rootNode: IMindMapNode): string {
  const lines: string[] = [];

  function traverse(node: IMindMapNode, depth: number) {
    const indent = '  '.repeat(depth);
    lines.push(`${indent}- ${node.title}`);
    if (node.notes) {
      lines.push(`${indent}  > ${node.notes}`);
    }
    for (const child of node.children) {
      traverse(child, depth + 1);
    }
  }

  traverse(rootNode, 0);
  return lines.join('\n');
}

export function downloadMarkdown(rootNode: IMindMapNode, filename: string) {
  const md = toMarkdown(rootNode);
  const blob = new Blob([md], { type: 'text/markdown' });
  downloadBlob(blob, `${filename}.md`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
