import { useEffect, useRef } from 'react';
import { Pencil, Trash2, Copy, ClipboardPaste } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  isRoot: boolean;
  hasCopiedNode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onClose: () => void;
}

export default function ContextMenu({
  x, y, nodeId, isRoot, hasCopiedNode,
  onEdit, onDelete, onCopy, onPaste, onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    // Delay adding listener to avoid immediate close from the right-click event
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('contextmenu', handleClick);
      document.addEventListener('keydown', handleKey);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('contextmenu', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 180);
  const adjustedY = Math.min(y, window.innerHeight - 200);

  const items = [
    { icon: Pencil, label: '编辑文字', onClick: onEdit, show: true },
    { icon: Copy, label: '复制节点', onClick: onCopy, show: true },
    { icon: ClipboardPaste, label: '粘贴节点', onClick: onPaste, show: hasCopiedNode },
    { icon: Trash2, label: '删除节点', onClick: onDelete, show: !isRoot, danger: true },
  ].filter((i) => i.show);

  return (
    <div
      ref={menuRef}
      className="fixed z-[200] glass-lg rounded-xl py-1.5 min-w-[160px] shadow-xl border border-gray-200/60 animate-scale-in"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors
            ${item.danger
              ? 'text-red-600 hover:bg-red-50/80'
              : 'text-gray-700 hover:bg-gray-50/80'
            }`}
        >
          <item.icon className="w-3.5 h-3.5 shrink-0" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
