import { create } from 'zustand';

export type PanelTab = 'style' | 'structure' | 'content';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIState {
  sidebarOpen: boolean;
  propertyPanelOpen: boolean;
  propertyPanelTab: PanelTab;
  toasts: Toast[];
  darkMode: boolean;

  toggleSidebar: () => void;
  openPanel: (tab?: PanelTab) => void;
  closePanel: () => void;
  setPanelTab: (tab: PanelTab) => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  toggleDarkMode: () => void;
}

let toastId = 0;

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  propertyPanelOpen: false,
  propertyPanelTab: 'style',
  toasts: [],
  darkMode: false,

  toggleSidebar: () =>
    set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  openPanel: (tab) =>
    set({ propertyPanelOpen: true, ...(tab ? { propertyPanelTab: tab } : {}) }),

  closePanel: () => set({ propertyPanelOpen: false }),

  setPanelTab: (tab) => set({ propertyPanelTab: tab }),

  addToast: (type, message) => {
    const id = String(++toastId);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));
