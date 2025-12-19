"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries, CandlestickData, LineData, Time, ColorType } from "lightweight-charts";
import { CandlestickChart, LineChart, ChevronDown, Activity } from "lucide-react";
import { LiveLineChart } from "./LiveLineChart";

type ChartType = "candlestick" | "line" | "live";

interface PriceChartProps {
  symbol?: string;
}

// Generate realistic-looking mock data
function generateMockData(): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  const now = Math.floor(Date.now() / 1000);
  let basePrice = 195;

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

// Convert candlestick data to line data
function candlestickToLine(data: CandlestickData<Time>[]): LineData<Time>[] {
  return data.map(candle => ({
    time: candle.time,
    value: candle.close,
  }));
}

// Create mock data and initial values once
function createInitialData() {
  const mockData = generateMockData();
  const lastCandle = mockData[mockData.length - 1];
  const firstCandle = mockData[0];
  return {
    mockData,
    initialPrice: lastCandle.close,
    initialChange: lastCandle.close - firstCandle.open,
    initialChangePercent: ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100,
    firstCandleOpen: firstCandle.open,
  };
}

export function PriceChart({ symbol = "SOL/USD" }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Use useState with lazy initializer to generate mock data once
  const [initialData] = useState(createInitialData);
  const mockDataRef = useRef(initialData.mockData);
  const firstCandleOpenRef = useRef(initialData.firstCandleOpen);

  const [currentPrice, setCurrentPrice] = useState<number>(initialData.initialPrice);
  const [priceChange, setPriceChange] = useState<number>(initialData.initialChange);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(initialData.initialChangePercent);
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [timeframe, setTimeframe] = useState("5m");

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

    // Create series based on chart type
    let series: ReturnType<typeof chart.addSeries>;

    if (chartType === "candlestick") {
      series = chart.addSeries(CandlestickSeries, {
        upColor: "#00F5A0",
        downColor: "#FF3B69",
        borderUpColor: "#00F5A0",
        borderDownColor: "#FF3B69",
        wickUpColor: "#00F5A0",
        wickDownColor: "#FF3B69",
      });
      series.setData(mockData);
    } else {
      series = chart.addSeries(LineSeries, {
        color: "#FF2D92",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBackgroundColor: "#FF2D92",
      });
      series.setData(candlestickToLine(mockData));
    }

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

      if (chartType === "candlestick") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (series as any).update(updatedCandle);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (series as any).update({
          time: updatedCandle.time,
          value: newClose,
        });
      }

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
      {/* Chart Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-4">
          {/* Token Pair Selector */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">S</span>
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{symbol}</span>
            <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
          </button>

          {/* Price Display */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[var(--text-primary)] font-mono flex items-center gap-1">
              <span className={isPositive ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}>
                {isPositive ? "↗" : "↘"}
              </span>
              ${currentPrice.toFixed(3)}
            </span>
          </div>

          {/* Change Info */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)]">Change %</span>
            <span className={`text-sm font-medium ${isPositive ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
              {isPositive ? "+" : ""}{priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-tertiary)] hidden sm:block">Chart Type</span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-secondary)]">
            <button
              onClick={() => setChartType("live")}
              className={`
                p-2 rounded-md transition-all
                ${chartType === "live"
                  ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }
              `}
              title="Live Line"
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`
                p-2 rounded-md transition-all
                ${chartType === "line"
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }
              `}
              title="Line Chart"
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("candlestick")}
              className={`
                p-2 rounded-md transition-all
                ${chartType === "candlestick"
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }
              `}
              title="Candlestick"
            >
              <CandlestickChart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[var(--border-subtle)]">
        {["1m", "5m", "15m", "1H", "4H", "1D"].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
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
        <div className="flex-1 min-h-[300px]">
          <LiveLineChart
            initialPrice={currentPrice}
            onPriceUpdate={(price) => {
              setCurrentPrice(price);
              // Calculate change from initial
              const change = price - 198.42;
              const changePercent = (change / 198.42) * 100;
              setPriceChange(change);
              setPriceChangePercent(changePercent);
            }}
          />
        </div>
      ) : (
        <div ref={chartContainerRef} className="flex-1 min-h-[300px]" />
      )}
    </div>
  );
}
