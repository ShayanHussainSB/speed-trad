"use client";

import { useEffect, useRef, useState } from "react";

interface LiveLineChartProps {
  initialPrice?: number;
  onPriceUpdate?: (price: number) => void;
  symbol?: string;
}

interface PricePoint {
  price: number;
  timestamp: number;
}

// Number of points to display - short tail like a snake head
const MAX_POINTS = 50;
// Update interval in ms - slower for more deliberate movement
const UPDATE_INTERVAL = 250;
// Chart ends before the right edge (large gap like reference - ~25% of width)
const RIGHT_GAP_PERCENT = 0.25;

// Solana Logo SVG Component
const SolanaLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 397 311"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="solana-gradient-chart"
        x1="360.879"
        y1="351.455"
        x2="141.213"
        y2="-69.2936"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#00FFA3" />
        <stop offset="1" stopColor="#DC1FFF" />
      </linearGradient>
    </defs>
    <path
      d="M64.6 237.9C67.5 235 71.5 233.3 75.7 233.3H391.5C398.5 233.3 402 241.8 397 246.8L332.4 311.4C329.5 314.3 325.5 316 321.3 316H5.5C-1.5 316 -5 307.5 0 302.5L64.6 237.9Z"
      fill="url(#solana-gradient-chart)"
    />
    <path
      d="M64.6 3.1C67.6 0.2 71.6 -1.5 75.7 -1.5H391.5C398.5 -1.5 402 7 397 12L332.4 76.6C329.5 79.5 325.5 81.2 321.3 81.2H5.5C-1.5 81.2 -5 72.7 0 67.7L64.6 3.1Z"
      fill="url(#solana-gradient-chart)"
    />
    <path
      d="M332.4 120.1C329.5 117.2 325.5 115.5 321.3 115.5H5.5C-1.5 115.5 -5 124 0 129L64.6 193.6C67.5 196.5 71.5 198.2 75.7 198.2H391.5C398.5 198.2 402 189.7 397 184.7L332.4 120.1Z"
      fill="url(#solana-gradient-chart)"
    />
  </svg>
);

// Generate smooth bezier curve path from points
function generateSmoothPath(
  points: PricePoint[],
  width: number,
  height: number,
  padding: { top: number; bottom: number; left: number; right: number }
): string {
  if (points.length < 2) return "";

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find price range
  const prices = points.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Add some padding to the price range
  const paddedMin = minPrice - priceRange * 0.1;
  const paddedMax = maxPrice + priceRange * 0.1;
  const paddedRange = paddedMax - paddedMin;

  // Convert points to coordinates
  const coords = points.map((point, index) => ({
    x: padding.left + (index / (points.length - 1)) * chartWidth,
    y: padding.top + chartHeight - ((point.price - paddedMin) / paddedRange) * chartHeight,
  }));

  // Create smooth curve using cubic bezier
  let path = `M ${coords[0].x} ${coords[0].y}`;

  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const next = coords[i + 1];
    const prevPrev = coords[i - 2];

    // Calculate control points for smooth curve
    const tension = 0.3;

    let cp1x: number, cp1y: number, cp2x: number, cp2y: number;

    if (i === 1) {
      cp1x = prev.x + (curr.x - prev.x) * tension;
      cp1y = prev.y + (curr.y - prev.y) * tension;
    } else {
      cp1x = prev.x + (curr.x - prevPrev.x) * tension;
      cp1y = prev.y + (curr.y - prevPrev.y) * tension;
    }

    if (!next) {
      cp2x = curr.x - (curr.x - prev.x) * tension;
      cp2y = curr.y - (curr.y - prev.y) * tension;
    } else {
      cp2x = curr.x - (next.x - prev.x) * tension;
      cp2y = curr.y - (next.y - prev.y) * tension;
    }

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  return path;
}

// Generate area path (for gradient fill below line)
function generateAreaPath(
  linePath: string,
  points: PricePoint[],
  width: number,
  height: number,
  padding: { top: number; bottom: number; left: number; right: number }
): string {
  if (!linePath || points.length < 2) return "";

  const chartWidth = width - padding.left - padding.right;
  const lastX = padding.left + chartWidth;
  const bottomY = height - padding.bottom;
  const firstX = padding.left;

  return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
}

// Generate random initial price between 120 and 170
const getRandomInitialPrice = () => 120 + Math.random() * 50;

// Generate initial price history with sharp step-like fluctuations
function generateInitialHistory(startPrice: number): { history: PricePoint[]; currentPrice: number } {
  const initialHistory: PricePoint[] = [];
  let price = startPrice;
  let trend = 0;
  let holdCounter = 0;
  let holdPrice = startPrice;
  const now = Date.now();

  for (let i = 0; i < MAX_POINTS; i++) {
    // Hold price for a few ticks then make a sharp move (creates step pattern)
    if (holdCounter > 0) {
      holdCounter--;
      price = holdPrice + (Math.random() - 0.5) * 0.02; // tiny noise while holding
    } else {
      // Time for a sharp move
      const moveSize = (Math.random() - 0.5) * startPrice * 0.015; // ~1.5% moves
      trend = trend * 0.6 + moveSize * 0.4;

      // Occasional big spike (20% chance)
      const spike = Math.random() > 0.8 ? (Math.random() - 0.5) * startPrice * 0.025 : 0;

      // Mean reversion
      const meanReversion = (startPrice - price) * 0.03;

      price = price + trend + spike + meanReversion;
      holdPrice = price;
      holdCounter = Math.floor(Math.random() * 4) + 2; // hold for 2-5 ticks
    }

    initialHistory.push({
      price: Math.round(price * 1000) / 1000, // Round to 3 decimals
      timestamp: now - (MAX_POINTS - i) * UPDATE_INTERVAL,
    });
  }

  return { history: initialHistory, currentPrice: Math.round(price * 1000) / 1000 };
}

// Create all initial data in one lazy initializer
function createInitialChartData(initialPrice?: number) {
  const basePriceValue = initialPrice ?? getRandomInitialPrice();
  const { history, currentPrice } = generateInitialHistory(basePriceValue);
  return { basePriceValue, history, currentPrice };
}

export function LiveLineChart({ initialPrice, onPriceUpdate }: LiveLineChartProps) {
  // Use lazy initializer to generate all initial data once
  const [initialData] = useState(() => createInitialChartData(initialPrice));

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>(initialData.history);
  const [currentPrice, setCurrentPrice] = useState(initialData.currentPrice);
  const priceRef = useRef<number>(initialData.currentPrice);
  const animationRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);

  // Calculate dynamic right gap based on width (25% of chart width for large gap like reference)
  const rightGap = Math.max(dimensions.width * RIGHT_GAP_PERCENT, 100);
  const padding = { top: 20, bottom: 40, left: 10, right: rightGap };

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Refs for step-like price movement
  const trendRef = useRef(0);
  const holdCounterRef = useRef(0);
  const holdPriceRef = useRef<number>(initialData.basePriceValue);
  const basePriceRef = useRef<number>(initialData.basePriceValue);
  const onPriceUpdateRef = useRef(onPriceUpdate);

  // Keep the callback ref updated
  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate;
  }, [onPriceUpdate]);

  // Start animation loop
  useEffect(() => {
    lastUpdateRef.current = Date.now();

    const updatePrice = () => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;

      if (delta >= UPDATE_INTERVAL) {
        lastUpdateRef.current = now;

        const currentPriceVal = priceRef.current;
        const meanPrice = basePriceRef.current;
        let newPrice: number;

        // Step-like movement: hold price then make sharp moves
        if (holdCounterRef.current > 0) {
          holdCounterRef.current--;
          // Tiny noise while holding (simulates order book activity)
          newPrice = holdPriceRef.current + (Math.random() - 0.5) * 0.015;
        } else {
          // Time for a sharp move
          const moveSize = (Math.random() - 0.5) * currentPriceVal * 0.012;
          trendRef.current = trendRef.current * 0.5 + moveSize * 0.5;

          // Occasional big spike (15% chance)
          const spike = Math.random() > 0.85 ? (Math.random() - 0.5) * currentPriceVal * 0.02 : 0;

          // Mean reversion to keep price in range
          const meanReversion = (meanPrice - currentPriceVal) * 0.02;

          newPrice = currentPriceVal + trendRef.current + spike + meanReversion;
          holdPriceRef.current = newPrice;
          holdCounterRef.current = Math.floor(Math.random() * 5) + 3; // hold for 3-7 ticks
        }

        // Round to 3 decimal places
        newPrice = Math.round(newPrice * 1000) / 1000;

        priceRef.current = newPrice;
        setCurrentPrice(newPrice);

        if (onPriceUpdateRef.current) {
          onPriceUpdateRef.current(newPrice);
        }

        setPriceHistory((prev) => {
          const newHistory = [
            ...prev.slice(-MAX_POINTS + 1),
            { price: newPrice, timestamp: now },
          ];
          return newHistory;
        });
      }

      animationRef.current = requestAnimationFrame(updatePrice);
    };

    animationRef.current = requestAnimationFrame(updatePrice);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const { width, height } = dimensions;
  const linePath = generateSmoothPath(priceHistory, width, height, padding);
  const areaPath = generateAreaPath(linePath, priceHistory, width, height, padding);

  // Get last point position for price label
  const lastPoint = priceHistory[priceHistory.length - 1];
  let labelY = height / 2;

  if (lastPoint && priceHistory.length > 1) {
    const prices = priceHistory.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const paddedMin = minPrice - priceRange * 0.1;
    const paddedMax = maxPrice + priceRange * 0.1;
    const paddedRange = paddedMax - paddedMin;
    const chartHeight = height - padding.top - padding.bottom;

    labelY = padding.top + chartHeight - ((lastPoint.price - paddedMin) / paddedRange) * chartHeight;
  }

  // Generate Y-axis labels
  const generateYAxisLabels = () => {
    if (priceHistory.length < 2) return [];

    const prices = priceHistory.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const paddedMin = minPrice - priceRange * 0.1;
    const paddedMax = maxPrice + priceRange * 0.1;

    const labels = [];
    const numLabels = 5;

    for (let i = 0; i <= numLabels; i++) {
      const price = paddedMin + ((paddedMax - paddedMin) * (numLabels - i)) / numLabels;
      const y = padding.top + ((height - padding.top - padding.bottom) * i) / numLabels;
      labels.push({ price, y });
    }

    return labels;
  };

  const yAxisLabels = generateYAxisLabels();

  return (
    <div ref={containerRef} className="w-full h-full relative bg-transparent">
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ overflow: "visible" }}
      >
        {/* Definitions for gradients and filters */}
        <defs>
          {/* Neon glow filter */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feGaussianBlur stdDeviation="6" result="coloredBlur2" />
            <feMerge>
              <feMergeNode in="coloredBlur2" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Line gradient */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#00F5A0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00F5A0" stopOpacity="1" />
          </linearGradient>

          {/* Area gradient */}
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#00F5A0" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#00F5A0" stopOpacity="0" />
          </linearGradient>

          {/* Price label glow */}
          <filter id="labelGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal grid lines - extend full width */}
        {yAxisLabels.map((label, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={label.y}
            x2={width - 80}
            y2={label.y}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="1"
          />
        ))}

        {/* Y-axis labels - stay on the right edge of the container */}
        {yAxisLabels.map((label, i) => (
          <text
            key={i}
            x={width - 70}
            y={label.y + 4}
            fill="#6B6B6B"
            fontSize="10"
            fontFamily="monospace"
          >
            {label.price.toFixed(3)}
          </text>
        ))}

        {/* Area fill */}
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#areaGradient)"
            style={{ transition: "d 80ms linear" }}
          />
        )}

        {/* Main line with glow */}
        {linePath && (
          <>
            {/* Glow layer */}
            <path
              d={linePath}
              fill="none"
              stroke="#00F5A0"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#neonGlow)"
              opacity="0.5"
              style={{ transition: "d 80ms linear" }}
            />
            {/* Main line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: "d 80ms linear" }}
            />
          </>
        )}

        {/* Current price indicator dot */}
        {priceHistory.length > 0 && (
          <g
            style={{
              transform: `translate(${width - padding.right}px, ${labelY}px)`,
              transition: "transform 80ms linear",
            }}
          >
            {/* Outer glow */}
            <circle r="8" fill="#00F5A0" opacity="0.2" className="animate-pulse" />
            {/* Inner dot */}
            <circle r="4" fill="#00F5A0" filter="url(#labelGlow)" />
          </g>
        )}

        {/* Horizontal line from dot to price label */}
        {priceHistory.length > 0 && (
          <line
            x1={width - padding.right}
            y1={labelY}
            x2={width - padding.right + 5}
            y2={labelY}
            stroke="#00F5A0"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.5"
          />
        )}
      </svg>

      {/* Floating price label - positioned at the end of the chart line */}
      {priceHistory.length > 0 && (
        <div
          className="absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#00F5A0] shadow-[0_0_20px_rgba(0,245,160,0.4)]"
          style={{
            right: rightGap - 75,
            top: labelY - 14,
            transition: "top 80ms linear",
          }}
        >
          <SolanaLogo className="w-4 h-4" />
          <span className="text-sm font-bold font-mono text-[#050505] tabular-nums">
            {currentPrice.toFixed(3)}
          </span>
        </div>
      )}
    </div>
  );
}

export default LiveLineChart;
