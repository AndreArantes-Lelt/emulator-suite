import { useCallback } from "react";
import { notification } from "antd";

type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationProps {
  title: string;
  description?: string;
}

function useNotification() {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = useCallback(
    (type: NotificationType, { title, description }: NotificationProps) => {
      api[type]({
        title,
        description,
      });
    },
    [api],
  );

  return { openNotification, contextHolder };
}

export default useNotification;
