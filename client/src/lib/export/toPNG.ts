export async function exportToPNG(svgElement: SVGSVGElement, filename: string) {
  // Clone the SVG for rendering
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // Get the bounding box of all content
  const innerGroup = svgElement.querySelector('g > g') as SVGGElement | null;
  const bbox = innerGroup?.getBBox();
  if (bbox) {
    clone.setAttribute('viewBox', `${bbox.x - 40} ${bbox.y - 40} ${bbox.width + 80} ${bbox.height + 80}`);
  }

  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.src = url;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  URL.revokeObjectURL(url);

  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${filename}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
      resolve();
    }, 'image/png');
  });
}
