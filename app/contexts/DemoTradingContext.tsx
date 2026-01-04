"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  DEMO_CONFIG,
  AssetSymbol,
  LeverageOption,
  calculateCloseFee,
  calculatePositionPnL,
  calculateLiquidationPrice,
  isPositionLiquidated,
  calculateMarginHealth,
  calculateFundingFee,
} from "@/app/config/demoTrading";

// Types
export interface DemoPosition {
  id: string;
  symbol: AssetSymbol;
  direction: "long" | "short";
  margin: number;
  leverage: LeverageOption;
  notional: number;
  entryPrice: number;
  liquidationPrice: number;
  openedAt: string;
}

export interface TradeRecord {
  id: string;
  symbol: AssetSymbol;
  direction: "long" | "short";
  margin: number;
  leverage: LeverageOption;
  notional: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  fee: number;
  outcome: "closed" | "liquidated";
  openedAt: string;
  closedAt: string;
}

interface DemoTradingState {
  balance: number;
  positions: DemoPosition[];
  tradeHistory: TradeRecord[];
  lastUpdated: string;
}

interface DemoTradingContextValue {
  // State
  balance: number;
  positions: DemoPosition[];
  tradeHistory: TradeRecord[];
  isHydrated: boolean;

  // Actions
  openPosition: (
    symbol: AssetSymbol,
    direction: "long" | "short",
    margin: number,
    leverage: LeverageOption,
    entryPrice: number
  ) => { success: boolean; error?: string; position?: DemoPosition };

  closePosition: (
    positionId: string,
    currentPrice: number
  ) => { success: boolean; pnl?: number; fee?: number; error?: string };

  checkLiquidations: (prices: Record<AssetSymbol, number>) => void;
  checkTakeProfit: (
    prices: Record<AssetSymbol, number>,
    onAutoClose?: (position: DemoPosition, currentPrice: number, pnl: number, pnlPercent: number) => void
  ) => void;

  resetDemo: () => void;

  // Utilities
  getPositionPnL: (position: DemoPosition, currentPrice: number) => number;
  getPositionHealth: (position: DemoPosition, currentPrice: number) => number;
  getPositionFundingFee: (position: DemoPosition) => number;
  getEstimatedCloseFee: (position: DemoPosition, currentPrice: number) => number;
}

const DemoTradingContext = createContext<DemoTradingContextValue | null>(null);

const DEFAULT_STATE: DemoTradingState = {
  balance: DEMO_CONFIG.INITIAL_BALANCE,
  positions: [],
  tradeHistory: [],
  lastUpdated: new Date().toISOString(),
};

// Helper to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function DemoTradingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<DemoTradingState>(DEFAULT_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEMO_CONFIG.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DemoTradingState;
        setState(parsed);
      }
    } catch (error) {
      console.error("Failed to load demo trading state:", error);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage on state change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(DEMO_CONFIG.STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save demo trading state:", error);
      }
    }
  }, [state, isHydrated]);

  // Open a new position
  const openPosition = useCallback(
    (
      symbol: AssetSymbol,
      direction: "long" | "short",
      margin: number,
      leverage: LeverageOption,
      entryPrice: number
    ) => {
      // Validate margin
      if (margin < DEMO_CONFIG.MIN_MARGIN) {
        return {
          success: false,
          error: `Minimum margin is $${DEMO_CONFIG.MIN_MARGIN}`,
        };
      }

      if (margin > state.balance) {
        return { success: false, error: "Insufficient balance" };
      }

      const maxMargin = state.balance * DEMO_CONFIG.MAX_MARGIN_PERCENT;
      if (margin > maxMargin) {
        return {
          success: false,
          error: `Maximum margin is $${maxMargin.toFixed(2)}`,
        };
      }

      const notional = margin * leverage;
      const liquidationPrice = calculateLiquidationPrice(
        direction,
        entryPrice,
        leverage
      );

      const newPosition: DemoPosition = {
        id: generateId(),
        symbol,
        direction,
        margin,
        leverage,
        notional,
        entryPrice,
        liquidationPrice,
        openedAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        balance: prev.balance - margin,
        positions: [...prev.positions, newPosition],
        lastUpdated: new Date().toISOString(),
      }));

      return { success: true, position: newPosition };
    },
    [state.balance]
  );

  // Close a position
  const closePosition = useCallback(
    (positionId: string, currentPrice: number) => {
      const position = state.positions.find((p) => p.id === positionId);
      if (!position) {
        return { success: false, error: "Position not found" };
      }

      const pnl = calculatePositionPnL(
        position.direction,
        position.entryPrice,
        currentPrice,
        position.notional
      );

      const closeFee = calculateCloseFee(position.notional, pnl);
      const fundingFee = calculateFundingFee(position.notional, position.openedAt);
      const totalFee = closeFee + fundingFee;

      const netPnl = pnl - totalFee;
      const returnAmount = position.margin + netPnl;

      const tradeRecord: TradeRecord = {
        id: generateId(),
        symbol: position.symbol,
        direction: position.direction,
        margin: position.margin,
        leverage: position.leverage,
        notional: position.notional,
        entryPrice: position.entryPrice,
        exitPrice: currentPrice,
        pnl: netPnl,
        fee: totalFee,
        outcome: "closed",
        openedAt: position.openedAt,
        closedAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        balance: prev.balance + Math.max(0, returnAmount),
        positions: prev.positions.filter((p) => p.id !== positionId),
        tradeHistory: [tradeRecord, ...prev.tradeHistory].slice(0, 100), // Keep last 100 trades
        lastUpdated: new Date().toISOString(),
      }));

      return { success: true, pnl: netPnl, fee: totalFee };
    },
    [state.positions]
  );

  // Check and process liquidations
  const checkLiquidations = useCallback(
    (prices: Record<AssetSymbol, number>) => {
      const liquidatedPositions: DemoPosition[] = [];

      state.positions.forEach((position) => {
        const currentPrice = prices[position.symbol];
        if (!currentPrice) return;

        const pnl = calculatePositionPnL(
          position.direction,
          position.entryPrice,
          currentPrice,
          position.notional
        );

        if (isPositionLiquidated(position.margin, pnl)) {
          liquidatedPositions.push(position);
        }
      });

      if (liquidatedPositions.length > 0) {
        const tradeRecords: TradeRecord[] = liquidatedPositions.map((position) => ({
          id: generateId(),
          symbol: position.symbol,
          direction: position.direction,
          margin: position.margin,
          leverage: position.leverage,
          notional: position.notional,
          entryPrice: position.entryPrice,
          exitPrice: prices[position.symbol],
          pnl: -position.margin * DEMO_CONFIG.LIQUIDATION_THRESHOLD, // Lost 70%
          fee: calculateFundingFee(position.notional, position.openedAt), // Only funding fee on liquidation
          outcome: "liquidated" as const,
          openedAt: position.openedAt,
          closedAt: new Date().toISOString(),
        }));

        const liquidatedIds = new Set(liquidatedPositions.map((p) => p.id));
        const remainingMargin = liquidatedPositions.reduce(
          (sum, p) => sum + p.margin * (1 - DEMO_CONFIG.LIQUIDATION_THRESHOLD),
          0
        );

        setState((prev) => ({
          ...prev,
          balance: prev.balance + remainingMargin, // Return 30% of margin
          positions: prev.positions.filter((p) => !liquidatedIds.has(p.id)),
          tradeHistory: [...tradeRecords, ...prev.tradeHistory].slice(0, 100),
          lastUpdated: new Date().toISOString(),
        }));
      }
    },
    [state.positions]
  );

  // Check and process take profit auto-closes
  const checkTakeProfit = useCallback(
    (
      prices: Record<AssetSymbol, number>,
      onAutoClose?: (position: DemoPosition, currentPrice: number, pnl: number, pnlPercent: number) => void
    ) => {
      const autoClosedPositions: DemoPosition[] = [];

      state.positions.forEach((position) => {
        const currentPrice = prices[position.symbol];
        if (!currentPrice) return;

        // Calculate take profit price (default 500% profit target)
        const takeProfitMove = 5 / position.leverage; // 500% / leverage
        const takeProfitPrice =
          position.direction === "long"
            ? position.entryPrice * (1 + takeProfitMove)
            : position.entryPrice * (1 - takeProfitMove);

        // Check if take profit is reached
        const isTakeProfitReached =
          position.direction === "long"
            ? currentPrice >= takeProfitPrice
            : currentPrice <= takeProfitPrice;

        if (isTakeProfitReached) {
          autoClosedPositions.push(position);
        }
      });

      if (autoClosedPositions.length > 0) {
        // Close positions that hit take profit
        autoClosedPositions.forEach((position) => {
          const currentPrice = prices[position.symbol];
          const pnl = calculatePositionPnL(
            position.direction,
            position.entryPrice,
            currentPrice,
            position.notional
          );

          const closeFee = calculateCloseFee(position.notional, pnl);
          const fundingFee = calculateFundingFee(position.notional, position.openedAt);
          const totalFee = closeFee + fundingFee;

          const netPnl = pnl - totalFee;
          const returnAmount = position.margin + netPnl;
          const pnlPercent = (netPnl / position.margin) * 100;

          // Call callback before closing
          if (onAutoClose) {
            onAutoClose(position, currentPrice, netPnl, pnlPercent);
          }

          const tradeRecord: TradeRecord = {
            id: generateId(),
            symbol: position.symbol,
            direction: position.direction,
            margin: position.margin,
            leverage: position.leverage,
            notional: position.notional,
            entryPrice: position.entryPrice,
            exitPrice: currentPrice,
            pnl: netPnl,
            fee: totalFee,
            outcome: "closed" as const,
            openedAt: position.openedAt,
            closedAt: new Date().toISOString(),
          };

          setState((prev) => ({
            ...prev,
            balance: prev.balance + Math.max(0, returnAmount),
            positions: prev.positions.filter((p) => p.id !== position.id),
            tradeHistory: [tradeRecord, ...prev.tradeHistory].slice(0, 100),
            lastUpdated: new Date().toISOString(),
          }));
        });
      }
    },
    [state.positions]
  );

  // Reset demo account
  const resetDemo = useCallback(() => {
    setState({
      ...DEFAULT_STATE,
      lastUpdated: new Date().toISOString(),
    });
  }, []);

  // Utility: Get position PnL
  const getPositionPnL = useCallback(
    (position: DemoPosition, currentPrice: number) => {
      return calculatePositionPnL(
        position.direction,
        position.entryPrice,
        currentPrice,
        position.notional
      );
    },
    []
  );

  // Utility: Get position health (margin remaining %)
  const getPositionHealth = useCallback(
    (position: DemoPosition, currentPrice: number) => {
      const pnl = calculatePositionPnL(
        position.direction,
        position.entryPrice,
        currentPrice,
        position.notional
      );
      return calculateMarginHealth(position.margin, pnl);
    },
    []
  );

  // Utility: Get current funding fee
  const getPositionFundingFee = useCallback(
    (position: DemoPosition) => {
      return calculateFundingFee(position.notional, position.openedAt);
    },
    []
  );

  // Utility: Get estimated close fee
  const getEstimatedCloseFee = useCallback(
    (position: DemoPosition, currentPrice: number) => {
      const pnl = calculatePositionPnL(
        position.direction,
        position.entryPrice,
        currentPrice,
        position.notional
      );
      const closeFee = calculateCloseFee(position.notional, pnl);
      const fundingFee = calculateFundingFee(position.notional, position.openedAt);
      return closeFee + fundingFee;
    },
    []
  );

  const value = useMemo<DemoTradingContextValue>(
    () => ({
      balance: state.balance,
      positions: state.positions,
      tradeHistory: state.tradeHistory,
      isHydrated,
      openPosition,
      closePosition,
      checkLiquidations,
      checkTakeProfit,
      resetDemo,
      getPositionPnL,
      getPositionHealth,
      getPositionFundingFee,
      getEstimatedCloseFee,
    }),
    [
      state.balance,
      state.positions,
      state.tradeHistory,
      isHydrated,
      openPosition,
      closePosition,
      checkLiquidations,
      checkTakeProfit,
      resetDemo,
      getPositionPnL,
      getPositionHealth,
      getPositionFundingFee,
      getEstimatedCloseFee,
    ]
  );

  return (
    <DemoTradingContext.Provider value={value}>
      {children}
    </DemoTradingContext.Provider>
  );
}

export function useDemoTradingContext() {
  const context = useContext(DemoTradingContext);
  if (!context) {
    throw new Error(
      "useDemoTradingContext must be used within a DemoTradingProvider"
    );
  }
  return context;
}


