import { useEffect, useState } from "react";
import { useNotification } from "@/hooks/use-notification";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

/**
 * Global accessibility service para aria-live announcements
 * Integra com o sistema de notificações para feedback acessível
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [announcement, setAnnouncement] = useState("");
  const { show } = useNotification();

  // Limpa announcement após 2 segundos
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  return (
    <>
      {children}
      {/* aria-live region para screen readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>
    </>
  );
}

/**
 * Hook para anunciar mudanças para screen readers
 */
export function useAccessibility() {
  const [announcement, setAnnouncement] = useState("");

  const announce = (message: string) => {
    setAnnouncement(message);
  };

  return { announce };
}

/**
 * Setup de atalhos de teclado globais
 */
export function useGlobalKeyboardShortcuts({
  onEscape,
  onEnter,
}: {
  onEscape?: () => void;
  onEnter?: () => void;
}) {
  useKeyboardShortcuts([
    {
      key: "Escape",
      callback: onEscape || (() => {}),
      disabled: !onEscape,
    },
    {
      key: "Enter",
      callback: onEnter || (() => {}),
      disabled: !onEnter,
    },
  ]);
}
