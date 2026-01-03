"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  playOpenSound,
  playProfitSound,
  playLossSound,
  playLiquidationSound,
} from "@/app/utils/sounds";

// Notification types
export type NotificationType = "position_opened" | "position_closed" | "liquidated";

export interface TradeNotification {
  id: string;
  type: NotificationType;
  direction: "long" | "short";
  symbol: string;
  entryPrice?: number;
  closePrice?: number;
  pnl?: number;
  pnlPercent?: number;
  timestamp: string;
  avatarId?: string;
}

interface NotificationContextValue {
  notifications: TradeNotification[];
  showPositionOpened: (data: {
    direction: "long" | "short";
    symbol: string;
    entryPrice: number;
  }) => void;
  showPositionClosed: (data: {
    direction: "long" | "short";
    symbol: string;
    closePrice: number;
    pnl: number;
    pnlPercent: number;
    avatarId?: string;
  }) => void;
  showLiquidation: (data: {
    direction: "long" | "short";
    symbol: string;
    closePrice: number;
    pnl: number;
  }) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// Auto-dismiss duration in milliseconds (4.5 seconds is industry best practice for trading)
const NOTIFICATION_DURATION = 4500;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<TradeNotification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<TradeNotification, "id" | "timestamp">) => {
      const id = generateId();
      const newNotification: TradeNotification = {
        ...notification,
        id,
        timestamp: new Date().toISOString(),
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-dismiss after duration
      setTimeout(() => {
        removeNotification(id);
      }, NOTIFICATION_DURATION);

      return id;
    },
    [removeNotification]
  );

  const showPositionOpened = useCallback(
    (data: { direction: "long" | "short"; symbol: string; entryPrice: number }) => {
      playOpenSound();
      addNotification({
        type: "position_opened",
        direction: data.direction,
        symbol: data.symbol,
        entryPrice: data.entryPrice,
      });
    },
    [addNotification]
  );

  const showPositionClosed = useCallback(
    (data: {
      direction: "long" | "short";
      symbol: string;
      closePrice: number;
      pnl: number;
      pnlPercent: number;
      avatarId?: string;
    }) => {
      // Play profit or loss sound based on PnL
      if (data.pnl >= 0) {
        playProfitSound();
      } else {
        playLossSound();
      }
      addNotification({
        type: "position_closed",
        direction: data.direction,
        symbol: data.symbol,
        closePrice: data.closePrice,
        pnl: data.pnl,
        pnlPercent: data.pnlPercent,
        avatarId: data.avatarId,
      });
    },
    [addNotification]
  );

  const showLiquidation = useCallback(
    (data: {
      direction: "long" | "short";
      symbol: string;
      closePrice: number;
      pnl: number;
    }) => {
      playLiquidationSound();
      addNotification({
        type: "liquidated",
        direction: data.direction,
        symbol: data.symbol,
        closePrice: data.closePrice,
        pnl: data.pnl,
        pnlPercent: -100, // Liquidation is always total loss
      });
    },
    [addNotification]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      showPositionOpened,
      showPositionClosed,
      showLiquidation,
      removeNotification,
    }),
    [notifications, showPositionOpened, showPositionClosed, showLiquidation, removeNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

