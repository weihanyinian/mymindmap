import { useEffect, useRef, useCallback } from 'react';
import { useMindMapStore } from '../stores/mindmapStore';
import { useUIStore } from '../stores/uiStore';

const LS_PREFIX = 'mindflow_map_';

export function useAutoSave() {
  const { isDirty, isSaving, autoSave, currentMap } = useMindMapStore();
  const addToast = useUIStore((s) => s.addToast);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save current map to localStorage
  const saveToLocalStorage = useCallback(() => {
    if (!currentMap) return;
    try {
      const key = LS_PREFIX + currentMap._id;
      const data = {
        title: currentMap.title,
        rootNode: currentMap.rootNode,
        theme: currentMap.theme,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // localStorage may be full or unavailable
    }
  }, [currentMap]);

  // Auto-save to server (1s debounce after dirty)
  useEffect(() => {
    if (!isDirty || isSaving) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      autoSave().then(() => saveToLocalStorage());
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, isSaving, autoSave, saveToLocalStorage]);

  // Periodic localStorage save (every 30 seconds)
  useEffect(() => {
    lsTimerRef.current = setInterval(() => {
      saveToLocalStorage();
    }, 30000);

    return () => {
      if (lsTimerRef.current) clearInterval(lsTimerRef.current);
    };
  }, [saveToLocalStorage]);

  // Save on Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        autoSave().then(() => {
          saveToLocalStorage();
          addToast('success', '已保存');
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [autoSave, saveToLocalStorage, addToast]);
}

// Restore from localStorage on page load (called from MindMapEditor)
export function loadFromLocalStorage(mapId: string) {
  try {
    const key = LS_PREFIX + mapId;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
