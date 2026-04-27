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
      stroke={highlight ? '#3b82f6' : style.lineColor}
      strokeWidth={highlight ? style.lineWidth + 1 : style.lineWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors duration-150"
    />
  );
}
