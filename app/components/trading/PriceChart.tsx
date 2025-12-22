"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, CandlestickSeries, CandlestickData, Time, ColorType } from "lightweight-charts";
import { CandlestickChart, ChevronDown, Activity, Command, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { LiveLineChart } from "./LiveLineChart";
import { TokenSelectorModal, Token } from "./TokenSelectorModal";
import { Position } from "@/app/hooks/usePositions";

type ChartType = "candlestick" | "live";

interface PriceChartProps {
  symbol?: string;
  onSymbolChange?: (symbol: string) => void;
  activePosition?: Position | null;
  onReversePosition?: (position: Position) => void;
}

// Fixed initial values for SSR hydration (random data generated client-side only)
const INITIAL_PRICE = 195;
const INITIAL_CHANGE = 0;
const INITIAL_CHANGE_PERCENT = 0;

// Generate realistic-looking mock data (client-side only)
function generateMockData(): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  const now = Math.floor(Date.now() / 1000);
  let basePrice = INITIAL_PRICE;

  for (let i = 200; i >= 0; i--) {
    const time = (now - i * 300) as Time; // 5-minute candles
    const volatility = 0.02;
    const change = (Math.random() - 0.48) * volatility * basePrice;

    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * 0.5;
    const low = Math.min(open, close) - Math.random() * 0.5;

    data.push({
      time,
      open,
      high,
      low,
      close,
    });

    basePrice = close;
  }

  return data;
}

export function PriceChart({ symbol = "SOL/USD", onSymbolChange, activePosition, onReversePosition }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const mockDataRef = useRef<CandlestickData<Time>[] | null>(null);
  const firstCandleOpenRef = useRef<number>(INITIAL_PRICE);

  // Use fixed initial values for SSR, update on client
  const [currentPrice, setCurrentPrice] = useState<number>(INITIAL_PRICE);
  const [priceChange, setPriceChange] = useState<number>(INITIAL_CHANGE);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(INITIAL_CHANGE_PERCENT);
  const [chartType, setChartType] = useState<ChartType>("live");
  const [timeframe, setTimeframe] = useState("5m");
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // Derive display symbol from selected token or prop
  const displaySymbol = selectedToken ? `${selectedToken.symbol}/USDC` : symbol;
  const tokenIcon = selectedToken?.icon || "#9945FF";

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

  // Initialize mock data on client only - uses recommended null-check pattern
  // This is the standard React pattern for lazy initialization of refs
  /* eslint-disable react-hooks/refs */
  if (mockDataRef.current === null && typeof window !== "undefined") {
    mockDataRef.current = generateMockData();
    firstCandleOpenRef.current = mockDataRef.current[0].open;
  }
  /* eslint-enable react-hooks/refs */

  useEffect(() => {
    // Skip lightweight-charts setup for live chart type
    if (chartType === "live" || !chartContainerRef.current) return;

    // Create chart with our theme colors
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

    // Use mock data from ref
    const mockData = mockDataRef.current || generateMockData();
    if (!mockDataRef.current) {
      mockDataRef.current = mockData;
    }

    // Create candlestick series
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00F5A0",
      downColor: "#FF3B69",
      borderUpColor: "#00F5A0",
      borderDownColor: "#FF3B69",
      wickUpColor: "#00F5A0",
      wickDownColor: "#FF3B69",
    });
    series.setData(mockData);

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Simulate real-time updates
    const interval = setInterval(() => {
      const lastData = mockData[mockData.length - 1];
      const priceVariation = (Math.random() - 0.48) * 0.5;
      const newClose = lastData.close + priceVariation;

      const updatedCandle: CandlestickData<Time> = {
        ...lastData,
        close: newClose,
        high: Math.max(lastData.high, newClose),
        low: Math.min(lastData.low, newClose),
      };

      series.update(updatedCandle);

      mockData[mockData.length - 1] = updatedCandle;
      setCurrentPrice(newClose);

      const firstOpen = firstCandleOpenRef.current;
      const totalChange = newClose - firstOpen;
      const totalChangePercent = (totalChange / firstOpen) * 100;
      setPriceChange(totalChange);
      setPriceChangePercent(totalChangePercent);
    }, 1000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
      chart.remove();
    };
  }, [chartType]);

  const isPositive = priceChange >= 0;

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
            <div
              className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
              style={{ background: selectedToken ? tokenIcon : "linear-gradient(135deg, #9945FF, #14F195)" }}
            >
              <span className="text-[8px] md:text-[10px] font-bold text-white">
                {selectedToken?.symbol[0] || "S"}
              </span>
            </div>
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
            <span className="text-lg md:text-2xl font-bold text-[var(--text-primary)] font-mono flex items-center gap-0.5 md:gap-1">
              <span className={isPositive ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}>
                {isPositive ? "↗" : "↘"}
              </span>
              ${currentPrice.toFixed(2)}
            </span>
            {/* Change % - Inline on mobile */}
            <span className={`text-xs md:text-sm font-medium md:hidden ${isPositive ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
              {isPositive ? "+" : ""}{priceChangePercent.toFixed(1)}%
            </span>
          </div>

          {/* Change Info - Desktop only */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)]">Change %</span>
            <span className={`text-sm font-medium ${isPositive ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
              {isPositive ? "+" : ""}{priceChangePercent.toFixed(2)}%
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

      {/* Timeframe Selector - Scrollable on mobile */}
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

      {/* Chart Container */}
      {chartType === "live" ? (
        <div className="flex-1 min-h-0">
          <LiveLineChart
            initialPrice={currentPrice}
            onPriceUpdate={(price) => {
              setCurrentPrice(price);
              // Calculate change from initial price reference
              const basePrice = firstCandleOpenRef.current;
              const change = price - basePrice;
              const changePercent = (change / basePrice) * 100;
              setPriceChange(change);
              setPriceChangePercent(changePercent);
            }}
          />
        </div>
      ) : (
        <div ref={chartContainerRef} className="flex-1 min-h-0" />
      )}

      {/* Token Selector Modal */}
      <TokenSelectorModal
        isOpen={isTokenSelectorOpen}
        onClose={() => setIsTokenSelectorOpen(false)}
        onSelectToken={handleTokenSelect}
        selectedToken={selectedToken || undefined}
        quoteToken="USDC"
      />
    </div>
  );
}
