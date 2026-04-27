import type { LineType } from '@mindflow/shared';

export function generateConnectionPath(
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  nodeWidth: number,
  lineType: LineType = 'curve'
): string {
  const startX = sx + nodeWidth / 2;
  const endX = ex - nodeWidth / 2;
  const dx = endX - startX;

  switch (lineType) {
    case 'straight':
      return `M ${startX} ${sy} L ${endX} ${ey}`;

    case 'angled': {
      const midX = startX + dx * 0.5;
      return `M ${startX} ${sy} L ${midX} ${sy} L ${midX} ${ey} L ${endX} ${ey}`;
    }

    case 'curve':
    default: {
      const cpOffset = Math.abs(dx) * 0.5;
      return (
        `M ${startX} ${sy} ` +
        `C ${startX + cpOffset} ${sy}, ${endX - cpOffset} ${ey}, ${endX} ${ey}`
      );
    }
  }
}
