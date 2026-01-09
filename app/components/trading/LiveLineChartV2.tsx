"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// =============================================================================
// TYPES
// =============================================================================

interface HistoricalPrice {
  time: number;
  price: number;
}

interface LiveLineChartV2Props {
  livePrice: number;
  symbol?: string;
  tokenImage?: string;
  tokenColor?: string;
  tokenSymbol?: string;
  entryPrice?: number;
  liquidationPrice?: number;
  takeProfitPrice?: number;
  positionDirection?: "long" | "short";
  pnlPercent?: number;
  pnlDollars?: number;
  historicalPrices?: HistoricalPrice[];
}

interface Point {
  x: number;
  y: number;
  price: number;
  time: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SCROLL_DURATION = 30000;
const FRAME_TIME_60FPS = 16.667;

// Smoothing factors
const PRICE_SMOOTHING = 0.12;
const SCALE_SMOOTHING = 0.015; // Much slower scale transitions to prevent line "breathing"

// Layout
const PADDING_TOP = 10;
const PADDING_BOTTOM = 10;
const RIGHT_GAP_PERCENT = 0.22;

// Grid
const GRID_BANDS = 10;
const SAFE_ZONE_TOP_BAND = 2;
const SAFE_ZONE_BOTTOM_BAND = 7;

// Visual
const LINE_COLOR = "#BFFF00";
const LINE_WIDTH = 3;
const GLOW_BLUR = 4;
const GLOW_OPACITY = 0.2;
const DOT_RADIUS = 7;
const DOT_INNER_RADIUS = 4;

// Point spacing - use TIME-based spacing for consistency
const POINT_INTERVAL_MS = 50; // Add a point every 50ms

// Minimum price range
const MIN_RANGE_PERCENT: Record<string, number> = {
  "SOL-USDC": 0.00004,
  "SOL-USD": 0.00004,
  "BTC-USDC": 0.00002,
  "BTC-USD": 0.00002,
  "ETH-USDC": 0.00003,
  "ETH-USD": 0.00003,
};
const DEFAULT_MIN_RANGE = 0.00004;

// =============================================================================
// GLOBAL PRICE HISTORY CACHE
// =============================================================================

interface PriceHistoryEntry {
  time: number;
  price: number;
}

interface SymbolCache {
  priceHistory: PriceHistoryEntry[];
  lastPrice: number;
  scaleMin: number;
  scaleMax: number;
}

const symbolPriceCache = new Map<string, SymbolCache>();
const MAX_HISTORY_DURATION = 60000;

function getSymbolCache(symbol: string): SymbolCache | undefined {
  return symbolPriceCache.get(symbol);
}

function updateSymbolCache(symbol: string, price: number, scaleMin: number, scaleMax: number) {
  const now = Date.now();
  let cache = symbolPriceCache.get(symbol);

  if (!cache) {
    cache = {
      priceHistory: [],
      lastPrice: price,
      scaleMin,
      scaleMax,
    };
    symbolPriceCache.set(symbol, cache);
  }

  cache.priceHistory.push({ time: now, price });
  cache.lastPrice = price;
  cache.scaleMin = scaleMin;
  cache.scaleMax = scaleMax;

  const cutoff = now - MAX_HISTORY_DURATION;
  cache.priceHistory = cache.priceHistory.filter(p => p.time >= cutoff);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getMinRangePercent(symbol?: string): number {
  if (!symbol) return DEFAULT_MIN_RANGE;
  return MIN_RANGE_PERCENT[symbol] || DEFAULT_MIN_RANGE;
}

// Simplified Catmull-Rom spline - smoother with less aggressive clamping
function generateSmoothPath(points: Point[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  const tension = 0.3; // Lower tension for smoother curves

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to Bezier control points
    const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

// =============================================================================
// SOLANA LOGO
// =============================================================================

const SolanaLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sol-grad-v3" x1="360.879" y1="351.455" x2="141.213" y2="-69.2936" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3" />
        <stop offset="1" stopColor="#DC1FFF" />
      </linearGradient>
    </defs>
    <path d="M64.6 237.9C67.5 235 71.5 233.3 75.7 233.3H391.5C398.5 233.3 402 241.8 397 246.8L332.4 311.4C329.5 314.3 325.5 316 321.3 316H5.5C-1.5 316 -5 307.5 0 302.5L64.6 237.9Z" fill="url(#sol-grad-v3)" />
    <path d="M64.6 3.1C67.6 0.2 71.6 -1.5 75.7 -1.5H391.5C398.5 -1.5 402 7 397 12L332.4 76.6C329.5 79.5 325.5 81.2 321.3 81.2H5.5C-1.5 81.2 -5 72.7 0 67.7L64.6 3.1Z" fill="url(#sol-grad-v3)" />
    <path d="M332.4 120.1C329.5 117.2 325.5 115.5 321.3 115.5H5.5C-1.5 115.5 -5 124 0 129L64.6 193.6C67.5 196.5 71.5 198.2 75.7 198.2H391.5C398.5 198.2 402 189.7 397 184.7L332.4 120.1Z" fill="url(#sol-grad-v3)" />
  </svg>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LiveLineChartV2({
  livePrice,
  symbol,
  tokenImage,
  tokenColor,
  tokenSymbol,
  entryPrice,
  liquidationPrice,
  takeProfitPrice,
  positionDirection,
  pnlPercent = 0,
  pnlDollars = 0,
  historicalPrices = [],
}: LiveLineChartV2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linePathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const priceLabelRef = useRef<HTMLDivElement>(null);
  const priceTextRef = useRef<HTMLSpanElement>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [isReady, setIsReady] = useState(false);

  const animFrameRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  
  // Store points with timestamps for time-based positioning
  const pointsRef = useRef<Point[]>([]);
  const lastPointTimeRef = useRef<number>(0);

  // Price tracking
  const targetPriceRef = useRef<number>(0);
  const displayPriceRef = useRef<number>(0);

  // Scale tracking - separate current and target for smooth transitions
  const scaleMinRef = useRef<number>(0);
  const scaleMaxRef = useRef<number>(0);
  const targetScaleMinRef = useRef<number>(0);
  const targetScaleMaxRef = useRef<number>(0);
  
  // Track when scale was last updated to batch updates
  const lastScaleUpdateRef = useRef<number>(0);

  const initializedRef = useRef<boolean>(false);
  const lastCacheUpdateRef = useRef<number>(0);

  const { width, height } = dimensions;
  const rightGap = Math.max(width * RIGHT_GAP_PERCENT, 80);
  const chartWidth = width - rightGap;
  const headX = width - rightGap;

  const bandHeight = height / GRID_BANDS;
  const safeZoneTop = SAFE_ZONE_TOP_BAND * bandHeight;
  const safeZoneBottom = SAFE_ZONE_BOTTOM_BAND * bandHeight;
  const safeZoneHeight = safeZoneBottom - safeZoneTop;

  const hasPosition = entryPrice && entryPrice > 0;
  const isWinning = hasPosition && (
    (positionDirection === "long" && livePrice > entryPrice) ||
    (positionDirection === "short" && livePrice < entryPrice)
  );
  const lineColor = hasPosition ? (isWinning ? "#00FF66" : "#FF3B69") : LINE_COLOR;

  // Convert price to Y using CURRENT scale values
  const priceToY = useCallback((price: number, scaleMin: number, scaleMax: number): number => {
    if (scaleMax <= scaleMin) return safeZoneTop + safeZoneHeight / 2;
    const normalized = (price - scaleMin) / (scaleMax - scaleMin);
    return safeZoneTop + safeZoneHeight * (1 - normalized);
  }, [safeZoneTop, safeZoneHeight]);

  // Convert time to X position (time-based, not frame-based)
  const timeToX = useCallback((time: number, now: number): number => {
    const age = now - time;
    const progress = age / SCROLL_DURATION;
    return headX - progress * chartWidth;
  }, [headX, chartWidth]);

  // Handle resize
  const prevDimensionsRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        prevDimensionsRef.current = { width: w, height: h };
        setDimensions({ width: w, height: h });
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Track previous symbol
  const prevSymbolRef = useRef<string | undefined>(undefined);

  // Restore from cache
  const restoreFromCache = useCallback((targetSymbol: string): boolean => {
    const cache = getSymbolCache(targetSymbol);
    if (!cache || cache.priceHistory.length === 0) return false;

    const now = Date.now();
    const windowStart = now - SCROLL_DURATION;
    const recentHistory = cache.priceHistory.filter(p => p.time >= windowStart);

    if (recentHistory.length === 0) return false;

    scaleMinRef.current = cache.scaleMin;
    scaleMaxRef.current = cache.scaleMax;
    targetScaleMinRef.current = cache.scaleMin;
    targetScaleMaxRef.current = cache.scaleMax;

    // Rebuild points from history - store with original timestamps
    const points: Point[] = recentHistory.map(p => ({
      x: 0, // Will be calculated at render time
      y: 0, // Will be calculated at render time
      price: p.price,
      time: p.time,
    }));

    pointsRef.current = points;
    targetPriceRef.current = cache.lastPrice;
    displayPriceRef.current = cache.lastPrice;
    lastPointTimeRef.current = points.length > 0 ? points[points.length - 1].time : now;

    return true;
  }, []);

  // Handle symbol changes
  useEffect(() => {
    if (prevSymbolRef.current === symbol) return;
    prevSymbolRef.current = symbol;

    lastFrameRef.current = 0;
    initializedRef.current = false;

    if (symbol) {
      const restored = restoreFromCache(symbol);
      if (restored) {
        initializedRef.current = true;
        setIsReady(true);
        return;
      }
    }

    pointsRef.current = [];
    targetPriceRef.current = 0;
    displayPriceRef.current = 0;
    scaleMinRef.current = 0;
    scaleMaxRef.current = 0;
    targetScaleMinRef.current = 0;
    targetScaleMaxRef.current = 0;
    lastPointTimeRef.current = 0;
    setIsReady(false);
  }, [symbol, restoreFromCache]);

  // Initialize chart
  useEffect(() => {
    if (livePrice <= 0 || initializedRef.current) return;
    if (targetPriceRef.current > 0) {
      targetPriceRef.current = livePrice;
      return;
    }

    initializedRef.current = true;
    targetPriceRef.current = livePrice;
    displayPriceRef.current = livePrice;

    let minPrice = livePrice;
    let maxPrice = livePrice;
    const now = Date.now();

    if (historicalPrices.length > 0) {
      const windowStart = now - SCROLL_DURATION;
      const recentPrices = historicalPrices.filter(p => p.time >= windowStart);

      if (recentPrices.length > 0) {
        const prices = recentPrices.map(p => p.price);
        minPrice = Math.min(...prices, livePrice);
        maxPrice = Math.max(...prices, livePrice);

        pointsRef.current = recentPrices.map(p => ({
          x: 0,
          y: 0,
          price: p.price,
          time: p.time,
        }));
        
        lastPointTimeRef.current = recentPrices[recentPrices.length - 1].time;
      }
    }

    const dataRange = maxPrice - minPrice;
    const minRangePercent = getMinRangePercent(symbol);
    const minRange = maxPrice * minRangePercent;
    const actualRange = Math.max(dataRange, minRange);
    const scaledRange = actualRange / 0.6;
    const center = (minPrice + maxPrice) / 2;

    scaleMinRef.current = center - scaledRange / 2;
    scaleMaxRef.current = center + scaledRange / 2;
    targetScaleMinRef.current = scaleMinRef.current;
    targetScaleMaxRef.current = scaleMaxRef.current;

    // If no historical points, create initial flat line
    if (pointsRef.current.length === 0) {
      const startTime = now - SCROLL_DURATION * 0.8;
      for (let t = startTime; t <= now; t += POINT_INTERVAL_MS) {
        pointsRef.current.push({ x: 0, y: 0, price: livePrice, time: t });
      }
      lastPointTimeRef.current = now;
    }

    setIsReady(true);
  }, [livePrice, historicalPrices, symbol]);

  // Update target price
  useEffect(() => {
    if (livePrice > 0 && isReady) {
      targetPriceRef.current = livePrice;
    }
  }, [livePrice, isReady]);

  // Main animation loop
  useEffect(() => {
    if (!isReady) return;

    let running = true;

    const animate = (timestamp: number) => {
      if (!running) return;

      if (lastFrameRef.current === 0) lastFrameRef.current = timestamp;
      const deltaTime = Math.min(timestamp - lastFrameRef.current, 50);
      lastFrameRef.current = timestamp;
      const normalizedDelta = deltaTime / FRAME_TIME_60FPS;

      const now = Date.now();

      // 1. Smooth price interpolation
      const priceDiff = targetPriceRef.current - displayPriceRef.current;
      const priceSmoothingFactor = 1 - Math.pow(1 - PRICE_SMOOTHING, normalizedDelta);
      displayPriceRef.current += priceDiff * priceSmoothingFactor;

      // 2. Add new points at consistent time intervals
      const timeSinceLastPoint = now - lastPointTimeRef.current;
      if (timeSinceLastPoint >= POINT_INTERVAL_MS) {
        // Add points to catch up (in case of frame drops)
        const pointsToAdd = Math.floor(timeSinceLastPoint / POINT_INTERVAL_MS);
        for (let i = 0; i < Math.min(pointsToAdd, 5); i++) { // Cap at 5 to prevent flooding
          const pointTime = lastPointTimeRef.current + POINT_INTERVAL_MS * (i + 1);
          pointsRef.current.push({
            x: 0,
            y: 0,
            price: displayPriceRef.current,
            time: pointTime,
          });
        }
        lastPointTimeRef.current = now;
      }

      // 3. Remove old points (outside visible window + buffer)
      const cutoffTime = now - SCROLL_DURATION - 1000;
      pointsRef.current = pointsRef.current.filter(p => p.time >= cutoffTime);

      // 4. Calculate target scale based on visible prices
      const visibleCutoff = now - SCROLL_DURATION;
      const visiblePrices = pointsRef.current
        .filter(p => p.time >= visibleCutoff)
        .map(p => p.price);
      visiblePrices.push(displayPriceRef.current);

      const dataMin = Math.min(...visiblePrices);
      const dataMax = Math.max(...visiblePrices);
      const dataRange = dataMax - dataMin;

      const minRangePercent = getMinRangePercent(symbol);
      const minRange = dataMax * minRangePercent;
      const actualRange = Math.max(dataRange, minRange);
      const scaledRange = actualRange / 0.6;
      const dataCenter = (dataMin + dataMax) / 2;

      targetScaleMinRef.current = dataCenter - scaledRange / 2;
      targetScaleMaxRef.current = dataCenter + scaledRange / 2;

      // Initialize scale if needed
      if (scaleMinRef.current === 0 && scaleMaxRef.current === 0) {
        scaleMinRef.current = targetScaleMinRef.current;
        scaleMaxRef.current = targetScaleMaxRef.current;
      }

      // 5. Smooth scale transitions - VERY slow to prevent visible "breathing"
      const scaleSmoothing = 1 - Math.pow(1 - SCALE_SMOOTHING, normalizedDelta);
      scaleMinRef.current += (targetScaleMinRef.current - scaleMinRef.current) * scaleSmoothing;
      scaleMaxRef.current += (targetScaleMaxRef.current - scaleMaxRef.current) * scaleSmoothing;

      // 6. Calculate positions for all points using current time and scale
      // This is the key change: positions are calculated fresh each frame based on TIME
      const renderPoints: Point[] = [];
      
      for (const p of pointsRef.current) {
        const x = timeToX(p.time, now);
        // Only include points that are visible or just about to enter
        if (x >= -50 && x <= headX + 10) {
          const y = priceToY(p.price, scaleMinRef.current, scaleMaxRef.current);
          renderPoints.push({ x, y, price: p.price, time: p.time });
        }
      }

      // Add current head position
      const currentY = priceToY(displayPriceRef.current, scaleMinRef.current, scaleMaxRef.current);
      
      // Ensure head point exists
      if (renderPoints.length === 0 || renderPoints[renderPoints.length - 1].time < now - POINT_INTERVAL_MS / 2) {
        renderPoints.push({
          x: headX,
          y: currentY,
          price: displayPriceRef.current,
          time: now,
        });
      } else {
        // Update the last point to be at the head
        const last = renderPoints[renderPoints.length - 1];
        last.x = headX;
        last.y = currentY;
      }

      // 7. Generate path
      const linePath = generateSmoothPath(renderPoints);

      // 8. Update DOM
      if (linePathRef.current) linePathRef.current.setAttribute("d", linePath);
      if (glowPathRef.current) glowPathRef.current.setAttribute("d", linePath);
      if (dotRef.current) dotRef.current.style.transform = `translate(${headX}px, ${currentY}px)`;
      if (priceLabelRef.current) priceLabelRef.current.style.top = `${currentY}px`;
      if (priceTextRef.current) priceTextRef.current.textContent = displayPriceRef.current.toFixed(3);

      // 9. Save to cache
      if (symbol && timestamp - lastCacheUpdateRef.current > 100) {
        lastCacheUpdateRef.current = timestamp;
        updateSymbolCache(symbol, displayPriceRef.current, scaleMinRef.current, scaleMaxRef.current);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isReady, width, height, headX, chartWidth, symbol, priceToY, timeToX]);

  if (!isReady) {
    return (
      <div ref={containerRef} className="w-full h-full relative bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-500 text-sm animate-pulse">Waiting for price data...</div>
      </div>
    );
  }

  const isPositiveChange = pnlPercent >= 0;
  const initialY = height / 2;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#0a0a0a] overflow-hidden">
      <svg width={width} height={height} className="absolute inset-0">
        <defs>
          <filter id="glowV3" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={GLOW_BLUR} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="headGlowV3" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="chartClipV3">
            <rect x="0" y="0" width={width} height={height} />
          </clipPath>
        </defs>

        {/* Grid */}
        <g opacity="0.08">
          {Array.from({ length: GRID_BANDS + 1 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={(height / GRID_BANDS) * i}
              x2={width}
              y2={(height / GRID_BANDS) * i}
              stroke="white"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: GRID_BANDS + 1 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(width / GRID_BANDS) * i}
              y1={0}
              x2={(width / GRID_BANDS) * i}
              y2={height}
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Price labels */}
        <g>
          {Array.from({ length: GRID_BANDS + 1 }).map((_, i) => {
            const y = (height / GRID_BANDS) * i;
            const min = scaleMinRef.current;
            const max = scaleMaxRef.current;
            if (max <= min) return null;

            const normalizedY = (y - safeZoneTop) / safeZoneHeight;
            const price = max - normalizedY * (max - min);

            if (!isFinite(price)) return null;

            return (
              <text
                key={`price-${i}`}
                x={width - 8}
                y={y + 4}
                fill="rgba(255, 255, 255, 0.4)"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
                textAnchor="end"
              >
                {price >= 1000 ? price.toFixed(2) : price.toFixed(3)}
              </text>
            );
          })}
        </g>

        <g clipPath="url(#chartClipV3)">
          <path
            ref={glowPathRef}
            d=""
            fill="none"
            stroke={lineColor}
            strokeWidth={LINE_WIDTH * 4}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={GLOW_OPACITY}
            filter="url(#glowV3)"
          />

          <path
            ref={linePathRef}
            d=""
            fill="none"
            stroke={lineColor}
            strokeWidth={LINE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <g
          ref={dotRef}
          style={{ transform: `translate(${headX}px, ${initialY}px)` }}
          filter="url(#headGlowV3)"
        >
          <circle r={DOT_RADIUS} fill={lineColor} opacity="0.4">
            <animate
              attributeName="r"
              values={`${DOT_RADIUS};${DOT_RADIUS * 1.4};${DOT_RADIUS}`}
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0.2;0.4"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r={DOT_INNER_RADIUS} fill={lineColor} />
          <circle r="1.5" fill="white" opacity="0.9" />
        </g>
      </svg>

      {/* Price label */}
      <div
        ref={priceLabelRef}
        className="absolute flex items-center z-20 pointer-events-none"
        style={{
          left: headX + 10,
          top: initialY,
          transform: "translateY(-50%)",
        }}
      >
        {hasPosition ? (
          <div
            className="flex items-center gap-2 px-3 py-1.5 relative"
            style={{
              backgroundColor: isPositiveChange ? "#00FF66" : "#FF3B69",
              clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
              boxShadow: isPositiveChange
                ? "0 0 20px rgba(0, 255, 102, 0.5)"
                : "0 0 20px rgba(255, 59, 105, 0.5)",
            }}
          >
            {tokenImage ? (
              <img src={tokenImage} alt={tokenSymbol || "Token"} className="w-4 h-4 rounded-full object-cover" />
            ) : tokenColor ? (
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: tokenColor }}>
                <span className="text-[7px] font-bold text-white">{tokenSymbol?.[0] || "?"}</span>
              </div>
            ) : (
              <SolanaLogo className="w-4 h-4" />
            )}
            <span className="text-base font-black font-mono tabular-nums text-[#0a0a0a]">
              {isPositiveChange ? "+" : ""}{pnlPercent.toFixed(2)}%
            </span>
            <span className="text-sm font-bold font-mono text-[#0a0a0a] opacity-80">
              {isPositiveChange ? "+" : "-"}${Math.abs(pnlDollars).toFixed(2)}
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-3 py-1"
            style={{
              backgroundColor: lineColor,
              clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
              boxShadow: `0 0 15px ${lineColor}40`,
            }}
          >
            {tokenImage ? (
              <img src={tokenImage} alt={tokenSymbol || "Token"} className="w-4 h-4 rounded-full object-cover" />
            ) : tokenColor ? (
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: tokenColor }}>
                <span className="text-[7px] font-bold text-white">{tokenSymbol?.[0] || "?"}</span>
              </div>
            ) : (
              <SolanaLogo className="w-4 h-4" />
            )}
            <span
              ref={priceTextRef}
              className="text-sm font-mono font-bold tabular-nums text-[#0a0a0a]"
            >
              {displayPriceRef.current.toFixed(3)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveLineChartV2;
