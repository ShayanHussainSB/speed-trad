"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  useDemoTradingContext,
  DemoPosition,
} from "@/app/contexts/DemoTradingContext";
import { useLivePrice } from "./useLivePrice";
import {
  DEMO_CONFIG,
  AssetSymbol,
  LeverageOption,
} from "@/app/config/demoTrading";
import { useNotifications } from "@/app/contexts/NotificationContext";

export interface PositionWithLivePnL extends DemoPosition {
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  health: number;
  closeFee: number;
  fundingFee: number;
  isNearLiquidation: boolean;
}

interface UseDemoTradingReturn {
  // State
  balance: number;
  positions: PositionWithLivePnL[];
  tradeHistory: ReturnType<typeof useDemoTradingContext>["tradeHistory"];
  isHydrated: boolean;

  // Computed
  totalPnL: number;
  totalMarginUsed: number;
  availableBalance: number;
  longCount: number;
  shortCount: number;

  // Actions
  openPosition: (
    symbol: AssetSymbol,
    direction: "long" | "short",
    margin: number,
    leverage: LeverageOption
  ) => { success: boolean; error?: string };

  closePosition: (
    positionId: string
  ) => { success: boolean; pnl?: number; fee?: number; error?: string };

  resetDemo: () => void;

  // Price getters
  getCurrentPrice: (symbol: AssetSymbol) => number;
  getPositionFundingFee: (position: DemoPosition) => number;
}

export function useDemoTrading(): UseDemoTradingReturn {
  const context = useDemoTradingContext();
  const { showAutoCloseTP } = useNotifications();
  const {
    balance,
    positions: rawPositions,
    tradeHistory,
    isHydrated,
    openPosition: contextOpenPosition,
    closePosition: contextClosePosition,
    checkLiquidations,
    checkTakeProfit,
    resetDemo,
    getPositionPnL,
    getPositionHealth,
    getPositionFundingFee: contextGetPositionFundingFee,
    getEstimatedCloseFee,
  } = context;

  // Get live prices for all supported assets (using exchange symbol format)
  const btcData = useLivePrice("BTC-USD");
  const ethData = useLivePrice("ETH-USD");
  const solData = useLivePrice("SOL-USD");

  const prices = useMemo<Record<AssetSymbol, number>>(
    () => ({
      BTC: btcData.price,
      ETH: ethData.price,
      SOL: solData.price,
    }),
    [btcData.price, ethData.price, solData.price]
  );

  // Get current price for a symbol
  const getCurrentPrice = useCallback(
    (symbol: AssetSymbol): number => {
      return prices[symbol] || 0;
    },
    [prices]
  );

  // Check for liquidations and take profit on every price update
  const lastCheckRef = useRef<number>(0);
  const lastPricesRef = useRef<string>("");

  useEffect(() => {
    if (rawPositions.length === 0) {
      return;
    }

    const priceKey = JSON.stringify(prices);
    const now = Date.now();

    // Check liquidations and take profit when prices change or at least every 500ms
    if (priceKey !== lastPricesRef.current || now - lastCheckRef.current > 500) {
      lastCheckRef.current = now;
      lastPricesRef.current = priceKey;

      checkLiquidations(prices);

      // Update price history for replay
      context.updatePriceHistory(prices);

      // Pass callback to checkTakeProfit to trigger notification
      checkTakeProfit(prices, (position, currentPrice, pnl, pnlPercent) => {
        showAutoCloseTP({
          direction: position.direction,
          symbol: position.symbol,
          closePrice: currentPrice,
          pnl,
          pnlPercent,
        });
      });
    }
  }, [prices, rawPositions.length, checkLiquidations, checkTakeProfit, showAutoCloseTP]);

  // Enhance positions with live PnL data
  const positions = useMemo<PositionWithLivePnL[]>(() => {
    return rawPositions.map((position) => {
      const currentPrice = prices[position.symbol] || position.entryPrice;
      const pnl = getPositionPnL(position, currentPrice);
      const pnlPercent = (pnl / position.margin) * 100;
      const health = getPositionHealth(position, currentPrice);
      const closeFee = getEstimatedCloseFee(position, currentPrice);
      const isNearLiquidation = health < 0.4; // Warning when below 40% health

      return {
        ...position,
        currentPrice,
        pnl,
        pnlPercent,
        health,
        closeFee,
        fundingFee: contextGetPositionFundingFee(position),
        isNearLiquidation,
      };
    });
  }, [rawPositions, prices, getPositionPnL, getPositionHealth, getEstimatedCloseFee, contextGetPositionFundingFee]);

  // Computed values
  const totalPnL = useMemo(
    () => positions.reduce((sum, p) => sum + p.pnl, 0),
    [positions]
  );

  const totalMarginUsed = useMemo(
    () => rawPositions.reduce((sum, p) => sum + p.margin, 0),
    [rawPositions]
  );

  const availableBalance = useMemo(
    () => balance,
    [balance]
  );

  const longCount = useMemo(
    () => positions.filter((p) => p.direction === "long").length,
    [positions]
  );

  const shortCount = useMemo(
    () => positions.filter((p) => p.direction === "short").length,
    [positions]
  );

  // Open position with current price
  const openPosition = useCallback(
    (
      symbol: AssetSymbol,
      direction: "long" | "short",
      margin: number,
      leverage: LeverageOption
    ) => {
      const currentPrice = prices[symbol];
      if (!currentPrice || currentPrice <= 0) {
        return { success: false, error: "Price not available" };
      }

      return contextOpenPosition(symbol, direction, margin, leverage, currentPrice);
    },
    [prices, contextOpenPosition]
  );

  // Close position with current price
  const closePosition = useCallback(
    (positionId: string) => {
      const position = rawPositions.find((p) => p.id === positionId);
      if (!position) {
        return { success: false, error: "Position not found" };
      }

      const currentPrice = prices[position.symbol];
      if (!currentPrice || currentPrice <= 0) {
        return { success: false, error: "Price not available" };
      }

      return contextClosePosition(positionId, currentPrice);
    },
    [rawPositions, prices, contextClosePosition]
  );

  return {
    balance,
    positions,
    tradeHistory,
    isHydrated,
    totalPnL,
    totalMarginUsed,
    availableBalance,
    longCount,
    shortCount,
    openPosition,
    closePosition,
    resetDemo,
    getCurrentPrice,
    getPositionFundingFee: contextGetPositionFundingFee,
  };
}

export default useDemoTrading;

