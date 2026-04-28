import { useMindMapStore } from '../../stores/mindmapStore';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Trash2, MoreHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Spinner from '../common/Spinner';
import ConfirmDialog from '../common/ConfirmDialog';
import { useT } from '../../lib/i18n';
import clsx from 'clsx';

export default function MindMapList() {
  const { mindMaps, isLoadingList, deleteMap } = useMindMapStore();
  const { id: currentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();

  if (isLoadingList) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="sm" />
      </div>
    );
  }

  if (mindMaps.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
        <p className="text-xs text-gray-400 leading-relaxed">{t.sidebar.noMaps}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
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
          t={t}
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
  t,
}: {
  map: { _id: string; title: string; rootNodeTitle: string; nodeCount: number; updatedAt: string };
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  t: ReturnType<typeof useT>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
    <>
      <div
        className={clsx(
          'flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl cursor-pointer group transition-all duration-200',
          isActive
            ? 'bg-primary-50/80 border border-primary-200/60 shadow-sm'
            : 'hover:bg-gray-50/80 border border-transparent'
        )}
        onClick={onClick}
      >
        <div className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
          isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200/80'
        )}>
          <FileText className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={clsx(
            'text-sm font-medium truncate transition-colors',
            isActive ? 'text-primary-700' : 'text-gray-700'
          )}>{map.title}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {map.nodeCount} {t.sidebar.nodes}
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className={clsx(
              'p-1 rounded-lg hover:bg-gray-200/80 transition-all',
              menuOpen ? 'opacity-100 bg-gray-200/80' : 'opacity-0 group-hover:opacity-100'
            )}
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 glass-lg rounded-xl py-1.5 z-50 min-w-[120px] shadow-lg animate-scale-in">
              <button
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-red-600 hover:bg-red-50/80 transition-colors"
                onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); setMenuOpen(false); }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.common.delete}
              </button>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={t.common.delete}
        message={t.common.deleteMapConfirm}
        variant="danger"
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onConfirm={() => { onDelete(); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
