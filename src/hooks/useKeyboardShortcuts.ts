import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onGlobalSearch?: () => void;
  onEscape?: () => void;
}

/**
 * Global keyboard shortcut handler.
 * Ctrl+K → global search focus
 * Esc → close drawers/modals
 */
export function useKeyboardShortcuts({ onGlobalSearch, onEscape }: KeyboardShortcutsOptions = {}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K — Global Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onGlobalSearch?.();
      }

      // Escape — close drawers/modals (only if no other handler caught it)
      if (e.key === 'Escape') {
        onEscape?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onGlobalSearch, onEscape]);
}
