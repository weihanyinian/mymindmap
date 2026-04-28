import type { LayoutNode } from '../../lib/d3/layout';
import { generateConnectionPath } from '../../lib/d3/paths';
import type { LineType } from '@mindflow/shared';

interface ConnectionLineProps {
  from: LayoutNode;
  to: LayoutNode;
  nodeWidth: number;
  highlight?: boolean;
}

export default function ConnectionLine({ from, to, nodeWidth, highlight }: ConnectionLineProps) {
  const style = to.data.style;

  // Don't draw connections for collapsed parent -> hidden children
  if (from.data.collapsed && from.children && from.children.length > 0) return null;

  const path = generateConnectionPath(
    from.x,
    from.y,
    to.x,
    to.y,
    nodeWidth,
    style.lineType
  );

  return (
    <path
      d={path}
      fill="none"
      stroke={highlight ? 'url(#line-gradient-highlight)' : style.lineColor}
      strokeWidth={highlight ? style.lineWidth + 1.5 : style.lineWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={highlight ? 1 : 0.7}
      className="transition-all duration-200"
    />
  );
}
