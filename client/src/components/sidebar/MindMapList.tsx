import { useMindMapStore } from '../../stores/mindmapStore';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Trash2, MoreHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Spinner from '../common/Spinner';
import clsx from 'clsx';

export default function MindMapList() {
  const { mindMaps, isLoadingList, deleteMap } = useMindMapStore();
  const { id: currentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (isLoadingList) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="sm" />
      </div>
    );
  }

  if (mindMaps.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-8 px-3">
        No mind maps yet. Click "New Mind Map" to get started.
      </p>
    );
  }

  return (
    <div className="px-3 space-y-0.5">
      {mindMaps.map((m) => (
        <MindMapListItem
          key={m._id}
          map={m}
          isActive={m._id === currentId}
          onClick={() => navigate(`/map/${m._id}`)}
          onDelete={async () => {
            await deleteMap(m._id);
            if (m._id === currentId) navigate('/');
          }}
        />
      ))}
    </div>
  );
}

function MindMapListItem({
  map,
  isActive,
  onClick,
  onDelete,
}: {
  map: { _id: string; title: string; rootNodeTitle: string; nodeCount: number; updatedAt: string };
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer group transition-colors',
        isActive ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50 border border-transparent'
      )}
      onClick={onClick}
    >
      <FileText className={clsx('w-4 h-4 shrink-0', isActive ? 'text-primary-500' : 'text-gray-400')} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{map.title}</p>
        <p className="text-xs text-gray-400 truncate">
          {map.rootNodeTitle} &middot; {map.nodeCount} nodes
        </p>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className={clsx('p-0.5 rounded hover:bg-gray-200', menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}
        >
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[100px]">
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
