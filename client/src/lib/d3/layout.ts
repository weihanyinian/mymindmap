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
}

export function computeLayout(
  rootData: IMindMapNode,
  options: LayoutOptions = { nodeWidth: 140, nodeHeight: 36, horizontalGap: 60, verticalGap: 8 }
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
  });

  return root as LayoutNode;
}
