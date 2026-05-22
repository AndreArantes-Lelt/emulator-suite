import { createContext, useContext, type ReactNode } from "react";
import { notification } from "antd";

type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationProps {
  title: string;
  description?: string;
}

type NotificationContextType = {
  openNotification: (type: NotificationType, props: NotificationProps) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (
    type: NotificationType,
    { title, description }: NotificationProps,
  ) => {
    api[type]({
      title,
      description,
    });
  };

  return (
    <NotificationContext.Provider value={{ openNotification }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used inside NotificationProvider");
  return ctx;
};
