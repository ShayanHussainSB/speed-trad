"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface LiveLineChartProps {
  /** Current live price from WebSocket */
  livePrice: number;
  /** Symbol being displayed */
  symbol?: string;
  /** Token image URL for the price label */
  tokenImage?: string;
  /** Fallback color if no image */
  tokenColor?: string;
  /** Token symbol for alt text */
  tokenSymbol?: string;
}

// ECG-style chart constants
const SCROLL_DURATION = 8000; // 8 seconds to cross entire screen
const SMOOTHING_FACTOR = 0.08; // How fast Y catches up to target (lower = smoother)
const POINT_INTERVAL = 16; // Add new point every ~16ms (60fps)
const MIN_POINTS = 2; // Minimum points before drawing

// Smart dynamic zoom constants
const PRICE_WINDOW_MS = 5000; // Rolling window for price analysis
const SCALE_SMOOTHING = 0.02; // How fast the zoom animates (lower = smoother transitions)
const SPIKE_SCALE_SMOOTHING = 0.15; // Faster zoom out for spikes (catch up quickly to big moves)
const MIN_VISIBLE_RANGE_PERCENT = 0.0005; // Minimum 0.05% of price as visible range (prevents over-zoom on flat prices)
const BREATHING_ROOM = 0.2; // 20% padding around actual price range

// Static padding values
const PADDING_TOP = 20;
const PADDING_BOTTOM = 40;
const PADDING_LEFT = 10;
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

// Point in the animated line (uses pixel coordinates)
interface LinePoint {
  x: number; // Pixel X position
  y: number; // Pixel Y position
}

// Price sample with timestamp for rolling window
interface PriceSample {
  price: number;
  timestamp: number;
}

// Generate smooth SVG path from pixel points
function generatePathFromPoints(points: LinePoint[]): string {
  if (points.length < 2) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const prevPrev = points[i - 2];

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

function generateAreaFromPath(
  linePath: string,
  points: LinePoint[],
  height: number,
  paddingBottom: number
): string {
  if (!linePath || points.length < 2) return "";

  const lastX = points[points.length - 1].x;
  const firstX = points[0].x;
  const bottomY = height - paddingBottom;

  return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
}

export function LiveLineChart({ livePrice, symbol, tokenImage, tokenColor, tokenSymbol }: LiveLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linePathRef = useRef<SVGPathElement>(null);
  const areaPathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const dotGroupRef = useRef<SVGGElement>(null);
  const priceLabelRef = useRef<HTMLDivElement>(null);
  const priceDisplayRef = useRef<HTMLSpanElement>(null);
  const outerGlowRef = useRef<SVGCircleElement>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [isReady, setIsReady] = useState(false);

  // Animation state (refs to avoid re-renders)
  const pointsRef = useRef<LinePoint[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const lastPointTimeRef = useRef<number>(0);

  // Price tracking
  const targetYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const targetPriceRef = useRef<number>(0);
  const currentPriceRef = useRef<number>(0);
  const lastPriceDirectionRef = useRef<"up" | "down" | null>(null);
  const glowIntensityRef = useRef<number>(0);

  // Rolling price window for dynamic zoom (cinematic scaling)
  const priceHistoryRef = useRef<PriceSample[]>([]);

  // Animated scale bounds (smoothly interpolate for cinematic zoom effect)
  const targetMinRef = useRef<number>(0);
  const targetMaxRef = useRef<number>(0);
  const currentMinRef = useRef<number>(0);
  const currentMaxRef = useRef<number>(0);

  const rightGap = Math.max(dimensions.width * RIGHT_GAP_PERCENT, 100);
  const { width, height } = dimensions;
  const chartWidth = width - PADDING_LEFT - rightGap;
  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM;

  // Calculate scroll speed based on chart width and duration
  const scrollSpeed = chartWidth / SCROLL_DURATION; // pixels per ms

  // Calculate smart range based on price dynamics - always shows full price action
  const calculateSmartRange = useCallback((minPrice: number, maxPrice: number): { min: number; max: number } => {
    const midPrice = (minPrice + maxPrice) / 2;
    const actualRange = maxPrice - minPrice;

    // Minimum visible range to prevent over-zoom on flat prices
    const minRange = midPrice * MIN_VISIBLE_RANGE_PERCENT;

    // Use actual range with breathing room - NO max cap so spikes are fully visible
    let targetRange = actualRange;

    if (targetRange < minRange) {
      // Price is too stable - expand to minimum visible range
      targetRange = minRange;
    } else {
      // Add breathing room around actual range (20% padding on each side)
      targetRange = actualRange * (1 + BREATHING_ROOM * 2);
    }

    // Center the range around the midpoint
    const halfRange = targetRange / 2;
    return {
      min: midPrice - halfRange,
      max: midPrice + halfRange,
    };
  }, []);

  // Convert price to Y pixel position using current animated scale
  const priceToY = useCallback((price: number, minPrice: number, maxPrice: number): number => {
    if (minPrice === 0 && maxPrice === 0) {
      return height / 2;
    }

    const { min: paddedMin, max: paddedMax } = calculateSmartRange(minPrice, maxPrice);
    const paddedRange = paddedMax - paddedMin;

    const y = PADDING_TOP + chartHeight - ((price - paddedMin) / paddedRange) * chartHeight;

    // Clamp Y to visible chart area to prevent overflow
    const minY = PADDING_TOP;
    const maxY = height - PADDING_BOTTOM;
    return Math.max(minY, Math.min(maxY, y));
  }, [chartHeight, height, calculateSmartRange]);

  // Handle dimension changes
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

  // Reset when symbol changes
  useEffect(() => {
    pointsRef.current = [];
    priceHistoryRef.current = [];
    targetMinRef.current = 0;
    targetMaxRef.current = 0;
    currentMinRef.current = 0;
    currentMaxRef.current = 0;
    currentYRef.current = height / 2;
    targetYRef.current = height / 2;
    currentPriceRef.current = 0;
    targetPriceRef.current = 0;
    lastPointTimeRef.current = 0;
    setIsReady(false);
  }, [symbol, height]);

  // Handle price updates - just set targets, animation loop does the rest
  useEffect(() => {
    if (livePrice <= 0) return;

    const now = Date.now();

    // Add to rolling price history for dynamic zoom
    priceHistoryRef.current.push({ price: livePrice, timestamp: now });

    // Remove old prices outside the window
    const cutoff = now - PRICE_WINDOW_MS;
    priceHistoryRef.current = priceHistoryRef.current.filter(p => p.timestamp > cutoff);

    // Calculate min/max from rolling window (cinematic zoom)
    if (priceHistoryRef.current.length > 0) {
      const prices = priceHistoryRef.current.map(p => p.price);
      targetMinRef.current = Math.min(...prices);
      targetMaxRef.current = Math.max(...prices);

      // Initialize current scale on first price
      if (currentMinRef.current === 0 && currentMaxRef.current === 0) {
        currentMinRef.current = targetMinRef.current;
        currentMaxRef.current = targetMaxRef.current;
      }
    }

    // Detect direction change for glow effect
    if (currentPriceRef.current > 0 && livePrice !== targetPriceRef.current) {
      const direction = livePrice > targetPriceRef.current ? "up" : "down";
      if (direction !== lastPriceDirectionRef.current) {
        glowIntensityRef.current = 1;
      } else {
        glowIntensityRef.current = Math.min(glowIntensityRef.current + 0.2, 1);
      }
      lastPriceDirectionRef.current = direction;
    }

    // Set targets - animation loop will smoothly interpolate
    targetPriceRef.current = livePrice;
    targetYRef.current = priceToY(livePrice, currentMinRef.current, currentMaxRef.current);

    // Initialize current values if first price
    if (currentPriceRef.current === 0) {
      currentPriceRef.current = livePrice;
      currentYRef.current = targetYRef.current;
    }

    if (!isReady && livePrice > 0) {
      setIsReady(true);
    }
  }, [livePrice, priceToY, isReady]);

  // Main animation loop - ECG style continuous scrolling
  useEffect(() => {
    if (!isReady) return;

    let isRunning = true;
    const headX = width - rightGap; // Fixed X position for the "pen head"

    const animate = (timestamp: number) => {
      if (!isRunning) return;

      // Initialize timing on first frame
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = timestamp;
        lastPointTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      // 1. Smooth the scale bounds (cinematic zoom transition)
      // Use faster smoothing when zooming OUT (spike detected) to keep price visible
      const dMin = targetMinRef.current - currentMinRef.current;
      const dMax = targetMaxRef.current - currentMaxRef.current;

      // Detect if we need to zoom out (target range is bigger than current range)
      const currentRange = currentMaxRef.current - currentMinRef.current;
      const targetRange = targetMaxRef.current - targetMinRef.current;
      const isZoomingOut = targetRange > currentRange * 1.1; // 10% threshold

      // Use faster smoothing for zoom out (spike), slower for zoom in (settling)
      const smoothing = isZoomingOut ? SPIKE_SCALE_SMOOTHING : SCALE_SMOOTHING;

      currentMinRef.current += dMin * smoothing;
      currentMaxRef.current += dMax * smoothing;

      // 2. Recalculate target Y with smoothed scale (enables smooth zoom)
      if (targetPriceRef.current > 0) {
        targetYRef.current = priceToY(targetPriceRef.current, currentMinRef.current, currentMaxRef.current);
      }

      // 3. Smooth current Y toward target Y (continuous interpolation)
      const dy = targetYRef.current - currentYRef.current;
      currentYRef.current += dy * SMOOTHING_FACTOR;

      // 4. Smooth current price toward target price
      const dp = targetPriceRef.current - currentPriceRef.current;
      currentPriceRef.current += dp * SMOOTHING_FACTOR;

      // 5. Decay glow intensity
      if (glowIntensityRef.current > 0) {
        glowIntensityRef.current *= 0.95;
        if (glowIntensityRef.current < 0.01) glowIntensityRef.current = 0;
      }

      // 6. Scroll all existing points leftward
      const scrollAmount = scrollSpeed * deltaTime;
      pointsRef.current.forEach(p => {
        p.x -= scrollAmount;
      });

      // 7. Remove points that scrolled off the left edge
      pointsRef.current = pointsRef.current.filter(p => p.x >= PADDING_LEFT);

      // 8. Add new point at fixed intervals (creates the continuous line)
      if (timestamp - lastPointTimeRef.current >= POINT_INTERVAL) {
        lastPointTimeRef.current = timestamp;
        pointsRef.current.push({
          x: headX,
          y: currentYRef.current,
        });
      }

      // 9. Update SVG paths directly (no React re-render)
      if (pointsRef.current.length >= MIN_POINTS) {
        const linePath = generatePathFromPoints(pointsRef.current);
        const areaPath = generateAreaFromPath(linePath, pointsRef.current, height, PADDING_BOTTOM);

        if (linePathRef.current) linePathRef.current.setAttribute("d", linePath);
        if (glowPathRef.current) glowPathRef.current.setAttribute("d", linePath);
        if (areaPathRef.current) areaPathRef.current.setAttribute("d", areaPath);
      }

      // 10. Update dot position (stays at headX, moves with currentY)
      if (dotGroupRef.current) {
        dotGroupRef.current.style.transform = `translate(${headX}px, ${currentYRef.current}px)`;
      }

      // 11. Update price label position
      if (priceLabelRef.current) {
        priceLabelRef.current.style.top = `${currentYRef.current - 12}px`;
      }

      // 12. Update price display
      if (priceDisplayRef.current && currentPriceRef.current > 0) {
        priceDisplayRef.current.textContent = currentPriceRef.current.toPrecision(6);
      }

      // 13. Update glow effect
      if (outerGlowRef.current) {
        const baseOpacity = 0.25;
        const glowOpacity = baseOpacity + glowIntensityRef.current * 0.5;
        const glowRadius = 6 + glowIntensityRef.current * 4;
        outerGlowRef.current.setAttribute("opacity", glowOpacity.toString());
        outerGlowRef.current.setAttribute("r", glowRadius.toString());
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReady, width, height, rightGap, scrollSpeed, priceToY]);

  // Generate Y-axis labels based on current animated scale (smart dynamic zoom)
  const yAxisLabels = [];
  if (currentMinRef.current > 0 && currentMaxRef.current > 0) {
    const { min: paddedMin, max: paddedMax } = calculateSmartRange(currentMinRef.current, currentMaxRef.current);

    const numLabels = 4;
    for (let i = 0; i <= numLabels; i++) {
      const price = paddedMin + ((paddedMax - paddedMin) * (numLabels - i)) / numLabels;
      const y = PADDING_TOP + (chartHeight * i) / numLabels;
      yAxisLabels.push({ price, y });
    }
  }

  // Show placeholder if not ready
  if (!isReady) {
    return (
      <div ref={containerRef} className="w-full h-full relative bg-transparent flex items-center justify-center">
        <div className="text-[var(--text-tertiary)] text-sm">Waiting for price data...</div>
      </div>
    );
  }

  const initialY = currentYRef.current || height / 2;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-transparent">
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00F5A0" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#00F5A0" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yAxisLabels.map((label, i) => (
          <line
            key={i}
            x1={PADDING_LEFT}
            y1={label.y}
            x2={width - 80}
            y2={label.y}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="1"
          />
        ))}

        {/* Y-axis labels */}
        {yAxisLabels.map((label, i) => (
          <text
            key={i}
            x={width - 70}
            y={label.y + 4}
            fill="#6B6B6B"
            fontSize="10"
            fontFamily="monospace"
          >
            {label.price.toPrecision(6)}
          </text>
        ))}

        {/* Area fill - updated via ref */}
        <path ref={areaPathRef} d="" fill="url(#areaGradient)" />

        {/* Glow line - updated via ref */}
        <path
          ref={glowPathRef}
          d=""
          fill="none"
          stroke="#00F5A0"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.15"
        />

        {/* Main line - updated via ref */}
        <path
          ref={linePathRef}
          d=""
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Animated indicator dot */}
        <g
          ref={dotGroupRef}
          style={{ transform: `translate(${width - rightGap}px, ${initialY}px)` }}
        >
          {/* Outer glow - animates on price changes */}
          <circle ref={outerGlowRef} r="6" fill="#00F5A0" opacity="0.25" />
          {/* Inner dot */}
          <circle r="3" fill="#00F5A0" />
        </g>
      </svg>

      {/* Floating price label */}
      <div
        ref={priceLabelRef}
        className="absolute flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#00F5A0] shadow-[0_0_12px_rgba(0,245,160,0.3)]"
        style={{
          right: rightGap - 70,
          top: initialY - 12,
        }}
      >
        {tokenImage ? (
          <img
            src={tokenImage}
            alt={tokenSymbol || "Token"}
            className="w-3.5 h-3.5 rounded-full object-cover"
          />
        ) : tokenColor ? (
          <div
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
            style={{ background: tokenColor }}
          >
            <span className="text-[6px] font-bold text-white">{tokenSymbol?.[0] || "?"}</span>
          </div>
        ) : (
          <SolanaLogo className="w-3.5 h-3.5" />
        )}
        <span ref={priceDisplayRef} className="text-sm font-bold font-mono text-[#050505] tabular-nums">
          {livePrice.toPrecision(6)}
        </span>
      </div>
    </div>
  );
}

export default LiveLineChart;
