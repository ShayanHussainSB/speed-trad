"use client";

import { useState, useCallback, useMemo } from "react";

export interface Position {
  id: string;
  symbol: string;
  direction: "long" | "short";
  size: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
  takeProfitPrice: number;
  openedAt: Date;
}

// Mock positions data - in production this would come from API/blockchain
const MOCK_POSITIONS: Position[] = [
  {
    id: "1",
    symbol: "SOL/USD",
    direction: "long",
    size: 50,
    entryPrice: 195.2,
    currentPrice: 198.42,
    leverage: 1000,
    pnl: 16.1,
    pnlPercent: 16.5,
    liquidationPrice: 177.42,
    takeProfitPrice: 215.0,
    openedAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "2",
    symbol: "SOL/USD",
    direction: "short",
    size: 25,
    entryPrice: 200.5,
    currentPrice: 198.42,
    leverage: 500,
    pnl: 5.2,
    pnlPercent: 10.4,
    liquidationPrice: 210.53,
    takeProfitPrice: 180.0,
    openedAt: new Date(Date.now() - 1000 * 60 * 120),
  },
];

const MINIMUM_MARGIN = 5; // $5 minimum order

export function usePositions() {
  const [positions, setPositions] = useState<Position[]>(MOCK_POSITIONS);
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
  const totalPnL = useMemo(
    () => positions.reduce((sum, p) => sum + p.pnl, 0),
    [positions]
  );

  const longCount = useMemo(
    () => positions.filter((p) => p.direction === "long").length,
    [positions]
  );

  const shortCount = useMemo(
    () => positions.filter((p) => p.direction === "short").length,
    [positions]
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
  const closePosition = useCallback((positionId: string) => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setPositions((prev) => prev.filter((p) => p.id !== positionId));
      setIsProcessing(false);
    }, 500);
  }, []);

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

      // Simulate API call - close current and open opposite
      setTimeout(() => {
        setPositions((prev) => {
          const filtered = prev.filter((p) => p.id !== position.id);
          const newPosition: Position = {
            ...position,
            id: `${Date.now()}`,
            direction: position.direction === "long" ? "short" : "long",
            entryPrice: position.currentPrice,
            pnl: 0,
            pnlPercent: 0,
            openedAt: new Date(),
            // Recalculate liquidation based on new direction
            liquidationPrice:
              position.direction === "long"
                ? position.currentPrice * (1 + 0.9 / position.leverage)
                : position.currentPrice * (1 - 0.9 / position.leverage),
            takeProfitPrice:
              position.direction === "long"
                ? position.currentPrice * 0.9
                : position.currentPrice * 1.1,
          };
          return [...filtered, newPosition];
        });
        setIsProcessing(false);
        closeReverseModal();
      }, 800);

      return { success: true };
    },
    [closeReverseModal]
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

    // Constants
    MINIMUM_MARGIN,
  };
}
