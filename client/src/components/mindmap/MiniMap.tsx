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
    const padding = 20;
    const scaleX = (width - padding * 2) / treeW;
    const scaleY = (height - padding * 2) / treeH;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = padding + (width - padding * 2 - treeW * scale) / 2 - minX * scale;
    const offsetY = padding + (height - padding * 2 - treeH * scale) / 2 - minY * scale;

    // Draw
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 0.5;

    function drawNode(node: LayoutNode, c: CanvasRenderingContext2D) {
      const nx = node.x * scale + offsetX;
      const ny = node.y * scale + offsetY;

      // Connection lines
      if (node.parent) {
        c.beginPath();
        c.moveTo(node.parent.x * scale + offsetX, node.parent.y * scale + offsetY);
        c.lineTo(nx, ny);
        c.stroke();
      }

      // Node dot
      c.fillStyle = '#9ca3af';
      c.beginPath();
      c.arc(nx, ny, 2, 0, Math.PI * 2);
      c.fill();

      if (node.children) {
        node.children.forEach((ch) => drawNode(ch as LayoutNode, c));
      }
    }
    drawNode(layoutRoot, ctx);

    // Viewport indicator
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, viewportWidth * scale, viewportHeight * scale);
  }, [layoutRoot, viewportWidth, viewportHeight]);

  return (
    <div className="absolute bottom-4 right-4 border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white opacity-70 hover:opacity-100 transition-opacity">
      <canvas ref={canvasRef} className="w-[180px] h-[120px]" />
    </div>
  );
}
