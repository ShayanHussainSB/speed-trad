"use client";

import { useState, useCallback, useMemo } from "react";
import { useDemoTrading, PositionWithLivePnL } from "./useDemoTrading";
import { AssetSymbol, LeverageOption } from "@/app/config/demoTrading";
import { useNotifications } from "@/app/contexts/NotificationContext";

export interface Position {
  id: string;
  symbol: string;
  direction: "long" | "short";
  size: number; // margin in USD
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
  takeProfitPrice: number;
  openedAt: Date;
  // Demo trading extensions
  notional?: number;
  health?: number;
  closeFee?: number;
  isNearLiquidation?: boolean;
}

const MINIMUM_MARGIN = 1; // $1 minimum order

// Convert demo position to Position interface
function toDemoPosition(p: PositionWithLivePnL): Position {
  // Calculate take profit price (default 500% profit target)
  const takeProfitMove = 5 / p.leverage; // 500% / leverage
  const takeProfitPrice =
    p.direction === "long"
      ? p.entryPrice * (1 + takeProfitMove)
      : p.entryPrice * (1 - takeProfitMove);

  return {
    id: p.id,
    symbol: p.symbol, // Raw symbol (e.g. "SOL")
    direction: p.direction,
    size: p.margin,
    entryPrice: p.entryPrice,
    currentPrice: p.currentPrice,
    leverage: p.leverage,
    pnl: p.pnl,
    pnlPercent: p.pnlPercent,
    liquidationPrice: p.liquidationPrice,
    takeProfitPrice,
    openedAt: new Date(p.openedAt),
    notional: p.notional,
    health: p.health,
    closeFee: p.closeFee,
    isNearLiquidation: p.isNearLiquidation,
  };
}

export function usePositions() {
  const demo = useDemoTrading();
  const { showPositionOpened, showPositionClosed } = useNotifications();
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Convert demo positions to Position interface
  const positions = useMemo<Position[]>(
    () => demo.positions.map(toDemoPosition),
    [demo.positions]
  );

  // Get position for a specific symbol
  const getPositionBySymbol = useCallback(
    (symbol: string) => {
      return positions.find((p) => p.symbol === symbol) || null;
    },
    [positions]
  );

  // Check if user has any active position
  const hasActivePosition = useMemo(() => positions.length > 0, [positions]);

  // Get the first/primary position (for single-position UX)
  const primaryPosition = useMemo(() => positions[0] || null, [positions]);

  // Calculate totals
  const totalPnL = useMemo(() => demo.totalPnL, [demo.totalPnL]);
  const longCount = useMemo(() => demo.longCount, [demo.longCount]);
  const shortCount = useMemo(() => demo.shortCount, [demo.shortCount]);

  // Open a new position (Market Order)
  const openPosition = useCallback(
    (data: {
      direction: "long" | "short";
      size: number; // margin in USD
      leverage: number;
      symbol: string;
    }) => {
      setIsProcessing(true);

      // Extract asset symbol from pair (e.g., "SOL/USD" -> "SOL")
      const assetSymbol = data.symbol.split("/")[0] as AssetSymbol;

      const result = demo.openPosition(
        assetSymbol,
        data.direction,
        data.size,
        data.leverage as LeverageOption
      );

      setIsProcessing(false);

      if (!result.success) {
        console.error("Failed to open position:", result.error);
      } else {
        // Show notification for successful position open
        const currentPrice = demo.getCurrentPrice(assetSymbol);
        showPositionOpened({
          direction: data.direction,
          symbol: assetSymbol,
          entryPrice: currentPrice,
        });
      }

      return result;
    },
    [demo, showPositionOpened]
  );

  // Open reverse modal for a position
  const openReverseModal = useCallback((position: Position) => {
    setSelectedPosition(position);
    setIsReverseModalOpen(true);
  }, []);

  // Close reverse modal
  const closeReverseModal = useCallback(() => {
    setIsReverseModalOpen(false);
    setSelectedPosition(null);
  }, []);

  // Close a position
  const closePosition = useCallback(
    (positionId: string) => {
      // Get position data before closing for notification
      const position = positions.find((p) => p.id === positionId);

      setIsProcessing(true);

      const result = demo.closePosition(positionId);

      setIsProcessing(false);

      if (!result.success) {
        console.error("Failed to close position:", result.error);
      } else if (position) {
        // Show notification for successful position close
        const pnl = result.pnl ?? 0;
        const pnlPercent = (pnl / position.size) * 100;

        showPositionClosed({
          direction: position.direction,
          symbol: position.symbol.split("/")[0],
          closePrice: position.currentPrice,
          pnl,
          pnlPercent,
        });
      }

      return result;
    },
    [demo, positions, showPositionClosed]
  );

  // Reverse a position (close current + open opposite)
  const reversePosition = useCallback(
    (position: Position, availableBalance: number) => {
      const requiredMargin = position.size;
      const marginAfterClose = availableBalance + position.size + position.pnl;

      // Check if we have enough margin
      if (marginAfterClose < MINIMUM_MARGIN) {
        return {
          success: false,
          error: "insufficient_margin",
          requiredMargin,
          availableAfterClose: marginAfterClose,
          shortfall: MINIMUM_MARGIN - marginAfterClose,
        };
      }

      if (marginAfterClose < requiredMargin) {
        return {
          success: false,
          error: "insufficient_margin",
          requiredMargin,
          availableAfterClose: marginAfterClose,
          shortfall: requiredMargin - marginAfterClose,
        };
      }

      setIsProcessing(true);

      // Close current position
      const closeResult = demo.closePosition(position.id);
      if (!closeResult.success) {
        setIsProcessing(false);
        return { success: false, error: closeResult.error };
      }

      // Show close notification
      const closePnl = closeResult.pnl ?? 0;
      const closePnlPercent = (closePnl / position.size) * 100;
      showPositionClosed({
        direction: position.direction,
        symbol: position.symbol.split("/")[0],
        closePrice: position.currentPrice,
        pnl: closePnl,
        pnlPercent: closePnlPercent,
      });

      // Extract asset symbol
      const assetSymbol = position.symbol.split("/")[0] as AssetSymbol;
      const newDirection = position.direction === "long" ? "short" : "long";

      // Open opposite position
      const openResult = demo.openPosition(
        assetSymbol,
        newDirection,
        position.size,
        position.leverage as LeverageOption
      );

      if (openResult.success) {
        // Show open notification for the new position
        const currentPrice = demo.getCurrentPrice(assetSymbol);
        showPositionOpened({
          direction: newDirection,
          symbol: assetSymbol,
          entryPrice: currentPrice,
        });
      }

      setIsProcessing(false);
      closeReverseModal();

      return openResult;
    },
    [demo, closeReverseModal, showPositionClosed, showPositionOpened]
  );

  // Calculate margin requirements for reverse
  const calculateReverseRequirements = useCallback(
    (position: Position, availableBalance: number) => {
      const requiredMargin = position.size;
      const marginAfterClose = availableBalance + position.size + position.pnl;
      const hasSufficientMargin = marginAfterClose >= requiredMargin;
      const shortfall = hasSufficientMargin ? 0 : requiredMargin - marginAfterClose;

      return {
        requiredMargin,
        marginAfterClose,
        hasSufficientMargin,
        shortfall,
        minimumMargin: MINIMUM_MARGIN,
      };
    },
    []
  );

  return {
    // State
    positions,
    hasActivePosition,
    primaryPosition,
    totalPnL,
    longCount,
    shortCount,
    isProcessing,

    // Demo specific
    balance: demo.balance,
    tradeHistory: demo.tradeHistory,
    isHydrated: demo.isHydrated,
    resetDemo: demo.resetDemo,

    // Reverse modal state
    isReverseModalOpen,
    selectedPosition,

    // Actions
    getPositionBySymbol,
    openReverseModal,
    closeReverseModal,
    closePosition,
    reversePosition,
    calculateReverseRequirements,
    openPosition,

    // Constants
    MINIMUM_MARGIN,
  };
}
