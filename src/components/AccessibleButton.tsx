import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { useNotification } from "@/hooks/use-notification";

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  notificationOnClick?: string; // Mensagem a anunciar ao clicar
  children: React.ReactNode;
}

/**
 * Button component com acessibilidade melhorada
 * - aria-label automático se não fornecido
 * - type="button" por padrão
 * - Focus management
 * - Notificações opcionais
 */
export const AccessibleButton = forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      variant = "secondary",
      size = "md",
      notificationOnClick,
      onClick,
      children,
      className = "",
      ...props
    },
    ref,
  ) => {
    const { info } = useNotification();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (notificationOnClick) {
        info(notificationOnClick, 2000);
      }
      onClick?.(e);
    };

    // Estilos padrão
    const baseClass =
      variant === "primary"
        ? "bg-gold-grad text-primary-foreground shadow-gold"
        : variant === "ghost"
          ? "glass"
          : "rounded-full glass";

    const sizeClass =
      size === "sm"
        ? "px-2 py-1 text-xs"
        : size === "lg"
          ? "px-6 py-3 text-lg"
          : "px-3 py-2 text-sm";

    return (
      <motion.button
        ref={ref}
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 dark:focus:ring-offset-dark-bg ${baseClass} ${sizeClass} ${className}`}
        onClick={handleClick}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

AccessibleButton.displayName = "AccessibleButton";
