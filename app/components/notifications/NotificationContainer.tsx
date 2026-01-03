"use client";

import { useNotifications } from "@/app/contexts/NotificationContext";
import { TradeNotification } from "./TradeNotification";

export function NotificationContainer() {
  const { notifications } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-1/4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <TradeNotification notification={notification} />
        </div>
      ))}
    </div>
  );
}

export default NotificationContainer;

