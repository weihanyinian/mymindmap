import { useEffect, useRef } from 'react';
import type { LayoutNode } from '../../lib/d3/layout';

interface MiniMapProps {
  layoutRoot: LayoutNode | null;
  viewportWidth: number;
  viewportHeight: number;
}

export default function MiniMap({ layoutRoot, viewportWidth, viewportHeight }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!layoutRoot || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 180;
    const height = 120;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Find bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    function findBounds(node: LayoutNode) {
      if (node.x < minX) minX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.x > maxX) maxX = node.x;
      if (node.y > maxY) maxY = node.y;
      if (node.children) {
        node.children.forEach((c) => findBounds(c as LayoutNode));
      }
    }
    findBounds(layoutRoot);

    const treeW = maxX - minX || 1;
    const treeH = maxY - minY || 1;
    const padding = 16;
    const scaleX = (width - padding * 2) / treeW;
    const scaleY = (height - padding * 2) / treeH;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = padding + (width - padding * 2 - treeW * scale) / 2 - minX * scale;
    const offsetY = padding + (height - padding * 2 - treeH * scale) / 2 - minY * scale;

    // Background with rounded corners
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, 4);
    ctx.fill();

    // Grid dots
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let gx = 0; gx < width; gx += 8) {
      for (let gy = 0; gy < height; gy += 8) {
        ctx.beginPath();
        ctx.arc(gx, gy, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawNode(node: LayoutNode, c: CanvasRenderingContext2D) {
      const nx = node.x * scale + offsetX;
      const ny = node.y * scale + offsetY;

      // Connection lines
      if (node.parent) {
        c.beginPath();
        c.moveTo(node.parent.x * scale + offsetX, node.parent.y * scale + offsetY);
        c.lineTo(nx, ny);
        c.strokeStyle = 'rgba(148,163,184,0.4)';
        c.lineWidth = 0.8;
        c.stroke();
      }

      // Node dot
      c.fillStyle = '#94a3b8';
      c.beginPath();
      c.arc(nx, ny, 2.2, 0, Math.PI * 2);
      c.fill();

      // Node dot border
      c.strokeStyle = 'rgba(255,255,255,0.8)';
      c.lineWidth = 0.8;
      c.stroke();

      if (node.children) {
        node.children.forEach((ch) => drawNode(ch as LayoutNode, c));
      }
    }
    drawNode(layoutRoot, ctx);
  }, [layoutRoot, viewportWidth, viewportHeight]);

  return (
    <div className="absolute bottom-4 right-4 glass rounded-xl overflow-hidden shadow-glass opacity-60 hover:opacity-100 transition-all duration-300 z-10 border border-gray-200/50">
      <canvas ref={canvasRef} className="w-[180px] h-[120px]" />
    </div>
  );
}
