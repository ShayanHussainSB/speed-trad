"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  playOpenSound,
  playCloseProfitSound,
  playCloseLossSound,
  playLiquidationSound,
  playAutoCloseTPSound,
  setSoundEnabled,
} from "@/app/utils/sounds";
import { useSettings } from "@/app/hooks/useSettings";
import { triggerWinConfetti, triggerBigWinConfetti } from "@/app/utils/confetti";

// Notification types
export type NotificationType = "position_opened" | "position_closed" | "liquidated" | "auto_closed_tp";

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
  }, suppressSound?: boolean) => void;
  showPositionClosed: (data: {
    direction: "long" | "short";
    symbol: string;
    closePrice: number;
    pnl: number;
    pnlPercent: number;
    avatarId?: string;
  }, suppressSound?: boolean) => void;
  showLiquidation: (data: {
    direction: "long" | "short";
    symbol: string;
    closePrice: number;
    pnl: number;
  }) => void;
  showAutoCloseTP: (data: {
    direction: "long" | "short";
    symbol: string;
    closePrice: number;
    pnl: number;
    pnlPercent: number;
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
  const { soundEnabled } = useSettings();

  // Update global sound enabled state
  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

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
    (data: { direction: "long" | "short"; symbol: string; entryPrice: number }, suppressSound = false) => {
      if (!suppressSound) {
        playOpenSound();
      }
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
    }, suppressSound = false) => {
      // Play profit or loss sound based on PnL (unless suppressed)
      if (!suppressSound) {
        if (data.pnl >= 0) {
          playCloseProfitSound();
        } else {
          playCloseLossSound();
        }
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

  const showAutoCloseTP = useCallback(
    (data: {
      direction: "long" | "short";
      symbol: string;
      closePrice: number;
      pnl: number;
      pnlPercent: number;
    }) => {
      playAutoCloseTPSound();
      
      // Trigger confetti for take profit wins (always profitable)
      if (data.pnl > 0) {
        if (data.pnlPercent >= 100) {
          triggerBigWinConfetti();
        } else {
          triggerWinConfetti();
        }
      }
      addNotification({
        type: "auto_closed_tp",
        direction: data.direction,
        symbol: data.symbol,
        closePrice: data.closePrice,
        pnl: data.pnl,
        pnlPercent: data.pnlPercent,
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
      showAutoCloseTP,
      removeNotification,
    }),
    [notifications, showPositionOpened, showPositionClosed, showLiquidation, showAutoCloseTP, removeNotification]
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

