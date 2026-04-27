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
  onTransform: (t: ZoomTransform) => void
): ZoomBehavior<SVGSVGElement, unknown> {
  const z = zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 3])
    .translateExtent([[-4000, -4000], [4000, 4000]])
    .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
      select(zoomGroupEl).attr('transform', event.transform.toString());
      onTransform({ x: event.transform.x, y: event.transform.y, k: event.transform.k });
    });

  select(svgEl).call(z);

  // Apply initial transform to center the view
  select(svgEl).call(z.transform, zoomIdentity.translate(200, 300).scale(1));

  return z;
}
