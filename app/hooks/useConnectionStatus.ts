"use client";

import { useMemo } from "react";
import { useMarketDataContext } from "@/app/contexts/MarketDataContext";
import type { ConnectionStatus } from "@/app/services/bulkTrade";

interface ConnectionStatusInfo {
  status: ConnectionStatus;
  isConnected: boolean;
  isReconnecting: boolean;
  label: string;
  color: string;
}

const STATUS_CONFIG: Record<ConnectionStatus, Omit<ConnectionStatusInfo, "status">> = {
  connected: {
    isConnected: true,
    isReconnecting: false,
    label: "Live",
    color: "var(--color-long)",
  },
  connecting: {
    isConnected: false,
    isReconnecting: false,
    label: "Connecting",
    color: "#F59E0B",
  },
  reconnecting: {
    isConnected: false,
    isReconnecting: true,
    label: "Reconnecting",
    color: "#F59E0B",
  },
  disconnected: {
    isConnected: false,
    isReconnecting: false,
    label: "Offline",
    color: "var(--color-short)",
  },
};

export function useConnectionStatus(): ConnectionStatusInfo {
  const { state } = useMarketDataContext();
  const { connectionStatus } = state;

  return useMemo(() => ({
    status: connectionStatus,
    ...STATUS_CONFIG[connectionStatus],
  }), [connectionStatus]);
}

export default useConnectionStatus;
