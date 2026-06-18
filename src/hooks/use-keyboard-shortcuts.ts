import { useEffect, useCallback } from "react";

export type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  disabled?: boolean;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.disabled) continue;

        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = (shortcut.ctrlKey ?? false) === (e.ctrlKey || e.metaKey);
        const shiftMatch = (shortcut.shiftKey ?? false) === e.shiftKey;
        const altMatch = (shortcut.altKey ?? false) === e.altKey;
        const metaMatch = (shortcut.metaKey ?? false) === e.metaKey && !e.ctrlKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          e.preventDefault();
          shortcut.callback();
          break;
        }
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
