"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, CandlestickSeries, CandlestickData, Time, ColorType } from "lightweight-charts";
import { CandlestickChart, ChevronDown, Activity, Command, RefreshCw, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { LiveLineChart } from "./LiveLineChart";
import { TokenSelectorModal, Token } from "./TokenSelectorModal";
import { Position } from "@/app/hooks/usePositions";
import { useMarketData } from "@/app/hooks/useMarketData";
import { useLivePrice } from "@/app/hooks/useLivePrice";
import type { ChartCandle } from "@/app/services/bulkTrade";

type ChartType = "candlestick" | "live";

interface PriceChartProps {
  symbol?: string;
  onSymbolChange?: (symbol: string) => void;
  activePosition?: Position | null;
  onReversePosition?: (position: Position) => void;
}

function toBulkSymbol(tokenSymbol: string): string {
  const normalized = tokenSymbol.replace(/[-\/]/g, "-").toUpperCase();
  const base = normalized.split("-")[0];
  return `${base}-USD`;
}

// Token metadata for initialization
const TOKEN_DATA: Record<string, Token> = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    address: "So11111111111111111111111111111111111111112",
    icon: "#9945FF",
    image: "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
    price: 0,
    change24h: 0,
    volume24h: 0,
    verified: true,
  },
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    address: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
    icon: "#F7931A",
    image: "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png",
    price: 0,
    change24h: 0,
    volume24h: 0,
    verified: true,
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    address: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    icon: "#627EEA",
    image: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
    price: 0,
    change24h: 0,
    volume24h: 0,
    verified: true,
  },
};

function getTokenFromSymbol(symbol: string): Token {
  const base = symbol.replace(/[-\/].*/, "").toUpperCase();
  return TOKEN_DATA[base] || TOKEN_DATA.SOL;
}

export function PriceChart({ symbol = "SOL/USD", onSymbolChange, activePosition, onReversePosition }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>["addSeries"]> | null>(null);
  const lastCandleCountRef = useRef<number>(0);
  const initialDataLoadedRef = useRef<boolean>(false);
  const isFetchingHistoryRef = useRef<boolean>(false);
  const hasMoreHistoryRef = useRef<boolean>(true);

  const [chartType, setChartType] = useState<ChartType>("live");
  const [timeframe, setTimeframe] = useState("5m");
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);

  // Initialize token from symbol prop
  const [selectedToken, setSelectedToken] = useState<Token>(() => getTokenFromSymbol(symbol));

  // Derive display symbol and Bulk.trade symbol
  const displaySymbol = `${selectedToken.symbol}/USDC`;
  const bulkSymbol = toBulkSymbol(displaySymbol);
  const tokenIcon = selectedToken.icon;
  const tokenImage = selectedToken.image;

  // Fetch live price data
  const {
    price: livePrice,
    priceChangePercent24h,
    isLoading: priceLoading,
  } = useLivePrice(bulkSymbol);

  // Fetch candlestick data
  const {
    candles,
    isLoading: candlesLoading,
    isLoadingHistory,
    error: candlesError,
    fetchOlderCandles,
  } = useMarketData(bulkSymbol, timeframe);

  // Track current price for display (use live price or last candle close)
  const currentPrice = livePrice > 0 ? livePrice : (candles[candles.length - 1]?.close ?? 0);
  const isPositive = priceChangePercent24h >= 0;

  // Reset chart state when symbol or timeframe changes
  useEffect(() => {
    lastCandleCountRef.current = 0;
    initialDataLoadedRef.current = false;
    isFetchingHistoryRef.current = false;
    hasMoreHistoryRef.current = true;
  }, [bulkSymbol, timeframe]);

  // Sync selectedToken when symbol prop changes from parent (e.g., PriceTicker click)
  useEffect(() => {
    const newToken = getTokenFromSymbol(symbol);
    if (newToken.symbol !== selectedToken.symbol) {
      setSelectedToken(newToken);
    }
  }, [symbol, selectedToken.symbol]);

  // Global keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsTokenSelectorOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTokenSelect = useCallback((token: Token) => {
    setSelectedToken(token);
    setIsTokenSelectorOpen(false);
    onSymbolChange?.(`${token.symbol}/USDC`);
  }, [onSymbolChange]);

  // Convert our candles to lightweight-charts format
  const convertToLightweightCandles = useCallback((chartCandles: ChartCandle[]): CandlestickData<Time>[] => {
    return chartCandles.map(candle => ({
      time: candle.time as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
  }, []);

  // Setup candlestick chart
  useEffect(() => {
    if (chartType !== "candlestick" || !chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6B6B6B",
        fontFamily: "system-ui, -apple-system, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(255, 45, 146, 0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#FF2D92",
        },
        horzLine: {
          color: "rgba(255, 45, 146, 0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#FF2D92",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;

    // Create candlestick series with proper price formatting
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00F5A0",
      downColor: "#FF3B69",
      borderUpColor: "#00F5A0",
      borderDownColor: "#FF3B69",
      wickUpColor: "#00F5A0",
      wickDownColor: "#FF3B69",
      priceFormat: {
        type: "price",
        precision: 6,
        minMove: 0.000001,
      },
    });

    seriesRef.current = series;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.clientWidth;
        const height = chartContainerRef.current.clientHeight;
        if (width > 0 && height > 0) {
          chart.applyOptions({ width, height });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    // Initial size - use requestAnimationFrame to ensure DOM has painted
    requestAnimationFrame(handleResize);

    // Subscribe to visible range changes for infinite scroll
    const handleVisibleRangeChange = (logicalRange: { from: number; to: number } | null) => {
      if (!logicalRange) return;

      // When user scrolls to the left edge (first ~10 bars visible), fetch more history
      if (logicalRange.from < 10 && !isFetchingHistoryRef.current && hasMoreHistoryRef.current) {
        isFetchingHistoryRef.current = true;

        // Get the oldest candle time from current data
        const currentCandles = seriesRef.current?.data() as CandlestickData<Time>[] | undefined;
        if (currentCandles && currentCandles.length > 0) {
          const oldestTime = currentCandles[0].time as number;

          fetchOlderCandles(oldestTime).then((newCandles) => {
            if (newCandles.length === 0) {
              // No more history available
              hasMoreHistoryRef.current = false;
            }
            isFetchingHistoryRef.current = false;
          }).catch(() => {
            isFetchingHistoryRef.current = false;
          });
        } else {
          isFetchingHistoryRef.current = false;
        }
      }
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      lastCandleCountRef.current = 0;
      initialDataLoadedRef.current = false;
    };
  }, [chartType, fetchOlderCandles]);

  // Update chart data when candles change
  useEffect(() => {
    if (chartType !== "candlestick" || !seriesRef.current || !chartRef.current || candles.length === 0) return;

    const lightweightCandles = convertToLightweightCandles(candles);

    if (!initialDataLoadedRef.current || lastCandleCountRef.current === 0) {
      // Initial load
      seriesRef.current.setData(lightweightCandles);
      chartRef.current.timeScale().fitContent();
      initialDataLoadedRef.current = true;
    } else if (candles.length > lastCandleCountRef.current) {
      // Check if new candles were added at the beginning (historical data) or end (real-time)
      const currentData = seriesRef.current.data() as CandlestickData<Time>[];
      const currentOldestTime = currentData.length > 0 ? currentData[0].time : null;
      const newOldestTime = lightweightCandles[0].time;

      if (currentOldestTime && newOldestTime < currentOldestTime) {
        // Historical data prepended - save scroll position, update data, restore position
        const visibleRange = chartRef.current.timeScale().getVisibleLogicalRange();
        seriesRef.current.setData(lightweightCandles);

        // Restore the visible range (adjusted for new data)
        if (visibleRange) {
          const addedCount = candles.length - lastCandleCountRef.current;
          chartRef.current.timeScale().setVisibleLogicalRange({
            from: visibleRange.from + addedCount,
            to: visibleRange.to + addedCount,
          });
        }
      } else {
        // New candles at the end (real-time updates)
        const newCandles = lightweightCandles.slice(lastCandleCountRef.current);
        newCandles.forEach(candle => {
          seriesRef.current?.update(candle);
        });
      }
    } else if (candles.length === lastCandleCountRef.current && candles.length > 0) {
      // Same count - just update the last candle
      const lastCandle = lightweightCandles[lightweightCandles.length - 1];
      seriesRef.current.update(lastCandle);
    }

    lastCandleCountRef.current = candles.length;
  }, [chartType, candles, convertToLightweightCandles]);

  // Update last candle with live price in real-time
  // This is necessary because Bulk.trade only sends candle snapshots, not real-time candle updates
  useEffect(() => {
    if (chartType !== "candlestick" || !seriesRef.current || candles.length === 0 || livePrice <= 0) return;

    const lastCandle = candles[candles.length - 1];
    if (!lastCandle) return;

    // Update the last candle with the live price
    const updatedCandle: CandlestickData<Time> = {
      time: lastCandle.time as Time,
      open: lastCandle.open,
      high: Math.max(lastCandle.high, livePrice),
      low: Math.min(lastCandle.low, livePrice),
      close: livePrice,
    };

    seriesRef.current.update(updatedCandle);
  }, [chartType, candles, livePrice]);

  return (
    <div className="flex flex-col h-full">
      {/* Chart Header - Compact on mobile */}
      <div className="flex items-center justify-between px-2 md:px-4 py-2 md:py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Token Pair Selector - Compact on mobile */}
          <button
            onClick={() => setIsTokenSelectorOpen(true)}
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--bg-elevated)] transition-all group"
          >
            {tokenImage ? (
              <img
                src={tokenImage}
                alt={selectedToken.symbol}
                className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                style={{ background: tokenIcon }}
              >
                <span className="text-[8px] md:text-[10px] font-bold text-white">
                  {selectedToken.symbol[0]}
                </span>
              </div>
            )}
            <span className="text-xs md:text-sm font-semibold text-[var(--text-primary)]">{displaySymbol}</span>
            <div className="flex items-center gap-1">
              <kbd className="hidden md:flex items-center gap-0.5 px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-[8px] font-medium text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                <Command className="w-2 h-2" />K
              </kbd>
              <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)] transition-colors" />
            </div>
          </button>

          {/* Price Display - Smaller on mobile */}
          <div className="flex items-center gap-1 md:gap-3">
            {priceLoading && currentPrice === 0 ? (
              <Loader2 className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" />
            ) : (
              <>
                <span className="text-lg md:text-2xl font-bold text-[var(--text-primary)] font-mono flex items-center gap-0.5 md:gap-1">
                  <span className={isPositive ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}>
                    {isPositive ? "↗" : "↘"}
                  </span>
                  ${currentPrice.toPrecision(6)}
                </span>
                {/* Change % - Inline on mobile */}
                <span className={`text-xs md:text-sm font-medium md:hidden ${isPositive ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                  {isPositive ? "+" : ""}{priceChangePercent24h.toFixed(1)}%
                </span>
              </>
            )}
          </div>

          {/* Change Info - Desktop only */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)]">Change %</span>
            <span className={`text-sm font-medium ${isPositive ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
              {isPositive ? "+" : ""}{priceChangePercent24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Reverse Position Button - Only show when there's an active position */}
          {activePosition && onReversePosition && (
            <button
              onClick={() => onReversePosition(activePosition)}
              className={`
                flex items-center gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs font-bold
                transition-all hover:-translate-y-0.5
                ${activePosition.direction === "long"
                  ? "bg-[var(--color-short)]/10 hover:bg-[var(--color-short)]/20 text-[var(--color-short)] border border-[var(--color-short)]/20"
                  : "bg-[var(--color-long)]/10 hover:bg-[var(--color-long)]/20 text-[var(--color-long)] border border-[var(--color-long)]/20"
                }
              `}
              title={`Reverse to ${activePosition.direction === "long" ? "Short" : "Long"}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reverse</span>
              {activePosition.direction === "long" ? (
                <TrendingDown className="w-3 h-3 hidden sm:block" />
              ) : (
                <TrendingUp className="w-3 h-3 hidden sm:block" />
              )}
            </button>
          )}

          {/* Chart Type Selector - Compact on mobile */}
          <div className="flex items-center gap-1 md:gap-2">
          <span className="text-xs text-[var(--text-tertiary)] hidden sm:block">Chart Type</span>
          <div className="flex items-center gap-0.5 md:gap-1 p-0.5 md:p-1 rounded-lg bg-[var(--bg-secondary)]">
            <button
              onClick={() => setChartType("live")}
              className={`
                p-1.5 md:p-2 rounded-md transition-all
                ${chartType === "live"
                  ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }
              `}
              title="Live Line"
            >
              <Activity className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => setChartType("candlestick")}
              className={`
                p-1.5 md:p-2 rounded-md transition-all
                ${chartType === "candlestick"
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }
              `}
              title="Candlestick"
            >
              <CandlestickChart className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Timeframe Selector - Only show for candlestick chart */}
      {chartType === "candlestick" && (
        <div className="flex items-center gap-0.5 md:gap-1 px-2 md:px-4 py-1.5 md:py-2 border-b border-[var(--border-subtle)] overflow-x-auto scrollbar-hide">
          {["1m", "5m", "15m", "1H", "4H", "1D"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`
                px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all duration-150 flex-shrink-0
                ${timeframe === tf
                  ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                }
              `}
            >
              {tf}
            </button>
          ))}
        </div>
      )}

      {/* Chart Container */}
      {chartType === "live" ? (
        <div className="flex-1 min-h-0 relative">
          {/* Live chart uses real WebSocket price data */}
          <LiveLineChart
            livePrice={livePrice}
            symbol={bulkSymbol}
            tokenImage={tokenImage}
            tokenColor={tokenIcon}
            tokenSymbol={selectedToken.symbol}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 relative">
          {candlesLoading && candles.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-primary)]/50 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
            </div>
          )}
          {candlesError && candles.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <p className="text-[var(--text-tertiary)] text-sm mb-2">Failed to load chart data</p>
                <p className="text-[var(--text-quaternary)] text-xs">{candlesError}</p>
              </div>
            </div>
          )}
          {/* Loading indicator for historical data (infinite scroll) */}
          {isLoadingHistory && (
            <div className="absolute top-2 left-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] z-10">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-primary)]" />
              <span className="text-xs text-[var(--text-secondary)]">Loading history...</span>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>
      )}

      {/* Token Selector Modal */}
      <TokenSelectorModal
        isOpen={isTokenSelectorOpen}
        onClose={() => setIsTokenSelectorOpen(false)}
        onSelectToken={handleTokenSelect}
        selectedToken={selectedToken}
        quoteToken="USDC"
      />
    </div>
  );
}
