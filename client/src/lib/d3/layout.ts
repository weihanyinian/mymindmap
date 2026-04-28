import { hierarchy, tree } from 'd3-hierarchy';
import type { HierarchyNode } from 'd3-hierarchy';
import type { IMindMapNode, MapStructure } from '@mindflow/shared';

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

export function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3000 && code <= 0x303f) ||
      (code >= 0x3400 && code <= 0x4dbf) ||
      (code >= 0xff00 && code <= 0xffef) ||
      (code >= 0xac00 && code <= 0xd7af)
    ) {
      width += fontSize;
    } else if (ch === ' ') {
      width += fontSize * 0.3;
    } else {
      width += fontSize * 0.55;
    }
  }
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
  structure: MapStructure = 'logic',
  options: LayoutOptions = DEFAULT_OPTIONS
): LayoutNode {
  function filterVisible(node: IMindMapNode): IMindMapNode {
    return {
      ...node,
      children: node.collapsed ? [] : node.children.map(filterVisible),
    };
  }

  const visibleRoot = filterVisible(rootData);
  const root = hierarchy<IMindMapNode>(visibleRoot);

  switch (structure) {
    case 'orgchart':
      return computeOrgChart(root, options);
    case 'fishbone':
      return computeFishbone(root, options);
    case 'timeline-h':
      return computeTimelineH(root, options);
    case 'timeline-v':
      return computeTimelineV(root, options);
    case 'mindmap':
    case 'logic':
    default:
      return computeMindMap(root, structure, options);
  }
}

// ── Mind Map / Logic Chart (horizontal tree) ────────────

function computeMindMap(
  root: HierarchyNode<IMindMapNode>,
  structure: MapStructure,
  options: LayoutOptions
): LayoutNode {
  const layout = tree<IMindMapNode>()
    .nodeSize([options.nodeHeight + options.verticalGap, options.nodeWidth + options.horizontalGap])
    .separation((a, b) => {
      if (a.parent === b.parent) return 1.2;
      return 2;
    });

  layout(root);

  // Swap x/y for horizontal layout
  root.each((node) => {
    if (structure === 'mindmap') {
      // For mindmap, alternate direction based on depth
      // Root at center, children to left and right
      // For now, keep it right-oriented like logic chart
      const temp = node.x;
      node.x = node.y;
      node.y = temp;
    } else {
      // Logic chart: right-only
      const temp = node.x;
      node.x = node.y;
      node.y = temp;
    }
    const lNode = node as LayoutNode;
    lNode.textWidth = estimateTextWidth(lNode.data.title, lNode.data.style.fontSize);
  });

  return root as LayoutNode;
}

// ── Org Chart (top-down tree) ────────────────────────────

function computeOrgChart(
  root: HierarchyNode<IMindMapNode>,
  options: LayoutOptions
): LayoutNode {
  const layout = tree<IMindMapNode>()
    .nodeSize([options.nodeWidth + options.horizontalGap, options.nodeHeight + options.verticalGap])
    .separation((a, b) => {
      if (a.parent === b.parent) return 1.2;
      return 2;
    });

  layout(root);

  // Don't swap — x is horizontal, y is vertical (top-down)
  root.each((node) => {
    const lNode = node as LayoutNode;
    lNode.textWidth = estimateTextWidth(lNode.data.title, lNode.data.style.fontSize);
  });

  return root as LayoutNode;
}

// ── Fishbone (diagonal layout) ──────────────────────────

function computeFishbone(
  root: HierarchyNode<IMindMapNode>,
  options: LayoutOptions
): LayoutNode {
  const angle = 35 * (Math.PI / 180); // 35 degrees
  const dx = options.nodeWidth + options.horizontalGap;
  const dy = options.nodeHeight + options.verticalGap;

  // Root positioned at left
  root.x = 0;
  root.y = 0;

  let branchY = 0;

  function layoutChildren(
    parent: HierarchyNode<IMindMapNode>,
    depth: number,
    above: boolean
  ): number {
    if (!parent.children) return 0;

    let totalY = 0;
    for (const child of parent.children) {
      const hChild = child as HierarchyNode<IMindMapNode>;
      hChild.x = (parent as LayoutNode).x + dx;
      hChild.y = above ? branchY - dy : branchY + dy;
      // Apply diagonal offset
      hChild.y += (hChild.x - (parent as LayoutNode).x) * Math.tan(angle) * (above ? -1 : 1);
      branchY = above ? hChild.y - dy : hChild.y + dy;

      if (hChild.children && hChild.children.length > 0) {
        const childTotal = layoutChildren(hChild, depth + 1, !above);
        totalY += childTotal;
      }
    }
    return totalY || dy;
  }

  if (root.children) {
    const above = root.children.slice(0, Math.ceil(root.children.length / 2));
    const below = root.children.slice(Math.ceil(root.children.length / 2));

    branchY = 0;
    for (const child of below) {
      const hChild = child as HierarchyNode<IMindMapNode>;
      hChild.x = (root as LayoutNode).x + dx;
      hChild.y = branchY + dy;
      hChild.y += hChild.x * Math.tan(angle);
      branchY = hChild.y;
      layoutChildren(hChild, 1, false);
    }

    branchY = 0;
    for (const child of above.reverse()) {
      const hChild = child as HierarchyNode<IMindMapNode>;
      hChild.x = (root as LayoutNode).x + dx;
      hChild.y = branchY - dy;
      hChild.y -= hChild.x * Math.tan(angle);
      branchY = hChild.y;
      layoutChildren(hChild, 1, true);
    }
  }

  root.each((node) => {
    const lNode = node as LayoutNode;
    lNode.textWidth = estimateTextWidth(lNode.data.title, lNode.data.style.fontSize);
  });

  return root as LayoutNode;
}

// ── Timeline Horizontal ─────────────────────────────────

function computeTimelineH(
  root: HierarchyNode<IMindMapNode>,
  options: LayoutOptions
): LayoutNode {
  const dx = options.nodeWidth + options.horizontalGap;
  const dy = options.nodeHeight + options.verticalGap;

  // Root on the left, children spread vertically along a line
  root.x = 0;
  root.y = 0;

  if (root.children) {
    root.children.forEach((child, i) => {
      const hChild = child as HierarchyNode<IMindMapNode>;
      hChild.x = dx * (i + 1);
      hChild.y = 0;

      if (hChild.children) {
        hChild.children.forEach((grandchild, j) => {
          const hgc = grandchild as HierarchyNode<IMindMapNode>;
          hgc.x = hChild.x;
          hgc.y = dy * (j + 1) * (j % 2 === 0 ? 1 : -1); // Alternate above/below
        });
      }
    });
  }

  root.each((node) => {
    const lNode = node as LayoutNode;
    lNode.textWidth = estimateTextWidth(lNode.data.title, lNode.data.style.fontSize);
  });

  return root as LayoutNode;
}

// ── Timeline Vertical ───────────────────────────────────

function computeTimelineV(
  root: HierarchyNode<IMindMapNode>,
  options: LayoutOptions
): LayoutNode {
  const dx = options.nodeWidth + options.horizontalGap;
  const dy = options.nodeHeight + options.verticalGap;

  root.x = 0;
  root.y = 0;

  if (root.children) {
    root.children.forEach((child, i) => {
      const hChild = child as HierarchyNode<IMindMapNode>;
      hChild.x = 0;
      hChild.y = dy * (i + 1);

      if (hChild.children) {
        hChild.children.forEach((grandchild, j) => {
          const hgc = grandchild as HierarchyNode<IMindMapNode>;
          hgc.x = dx * (j + 1);
          hgc.y = hChild.y;
        });
      }
    });
  }

  root.each((node) => {
    const lNode = node as LayoutNode;
    lNode.textWidth = estimateTextWidth(lNode.data.title, lNode.data.style.fontSize);
  });

  return root as LayoutNode;
}
