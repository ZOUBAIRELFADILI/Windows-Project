/** UI-only state: assistant panel, guided tour, toasts. */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface Toast {
  id: number;
  text: string;
}

interface Ui {
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  tourOpen: boolean;
  setTourOpen: (open: boolean) => void;
  toasts: Toast[];
  toast: (text: string) => void;
}

const UiContext = createContext<Ui | null>(null);
const TOUR_KEY = 'fenetres-pro-admin:tour-seen';

export function UiProvider({ children }: { children: ReactNode }) {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [tourOpen, setTourOpenState] = useState(() => {
    try {
      return localStorage.getItem(TOUR_KEY) !== '1';
    } catch {
      return false;
    }
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  const setTourOpen = useCallback((open: boolean) => {
    setTourOpenState(open);
    if (!open) {
      try {
        localStorage.setItem(TOUR_KEY, '1');
      } catch {
        /* ignore */
      }
    }
  }, []);

  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const value = useMemo(
    () => ({ assistantOpen, setAssistantOpen, tourOpen, setTourOpen, toasts, toast }),
    [assistantOpen, tourOpen, setTourOpen, toasts, toast],
  );
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): Ui {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used inside <UiProvider>');
  return ctx;
}
