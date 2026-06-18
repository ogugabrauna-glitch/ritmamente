import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type NotificationType = "success" | "error" | "info" | "warning" | "loading";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface NotificationContextType {
  notifications: Notification[];
  show: (message: string, type?: NotificationType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  loading: (message: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = () => `notification-${Date.now()}-${Math.random()}`;

  const show = (message: string, type: NotificationType = "info", duration = 4000) => {
    const id = generateId();
    
    // Use sonner para mostrar toast
    if (type === "success") toast.success(message, { duration });
    else if (type === "error") toast.error(message, { duration });
    else if (type === "warning") toast.warning(message, { duration });
    else if (type === "loading") toast.loading(message);
    else toast(message, { duration });

    // Manter estado interno também (para componentes que querem acessar via context)
    const notification: Notification = { id, message, type, duration };
    setNotifications((prev) => [...prev, notification]);

    if (duration && type !== "loading") {
      setTimeout(() => dismiss(id), duration);
    }
  };

  const success = (message: string, duration?: number) => show(message, "success", duration);
  const error = (message: string, duration?: number) => show(message, "error", duration);
  const info = (message: string, duration?: number) => show(message, "info", duration);
  const warning = (message: string, duration?: number) => show(message, "warning", duration);
  const loading = (message: string) => show(message, "loading");

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
    toast.dismiss();
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, show, success, error, info, warning, loading, dismiss, dismissAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
