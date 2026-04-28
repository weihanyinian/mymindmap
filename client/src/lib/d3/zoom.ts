import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { select } from 'd3-selection';
import type { D3ZoomEvent } from 'd3-zoom';

export interface ZoomTransform {
  x: number;
  y: number;
  k: number;
}

export function setupZoom(
  svgEl: SVGSVGElement,
  zoomGroupEl: SVGGElement,
  onTransform: (t: ZoomTransform) => void,
  rootNodeId: string
): ZoomBehavior<SVGSVGElement, unknown> {
  const z = zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 3])
    .translateExtent([[-4000, -4000], [4000, 4000]])
    .filter((event) => {
      // Allow wheel events always
      if (event.type === 'wheel') return true;
      if (event.type === 'mousedown' && event.button === 0) {
        // Don't allow zoom when dragging a non-root node (those use React drag handler)
        const target = event.target as Element;
        const draggableEl = target.closest('[data-draggable="true"]');
        if (draggableEl) return false;
        // Also check if clicking on the node's text or collapse button
        const nodeEl = target.closest('[data-node-id]');
        if (nodeEl && nodeEl.getAttribute('data-node-id') !== rootNodeId) return false;
        return true;
      }
      return false;
    })
    .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
      select(zoomGroupEl).attr('transform', event.transform.toString());
      onTransform({ x: event.transform.x, y: event.transform.y, k: event.transform.k });
    });

  select(svgEl).call(z);

  // Apply initial transform to center the view
  select(svgEl).call(z.transform, zoomIdentity.translate(200, 300).scale(1));

  return z;
}

export function teardownZoom(
  svgEl: SVGSVGElement,
  z: ZoomBehavior<SVGSVGElement, unknown>
): void {
  select(svgEl).on('.zoom', null);
}
