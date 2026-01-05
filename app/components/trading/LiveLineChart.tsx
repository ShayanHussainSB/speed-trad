"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface HistoricalPrice {
  time: number;
  price: number;
}

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
  /** Entry price for position */
  entryPrice?: number;
  /** Liquidation price to show on chart */
  liquidationPrice?: number;
  /** Take profit price to show on chart */
  takeProfitPrice?: number;
  /** Position direction (affects line colors/labels) */
  positionDirection?: "long" | "short";
  /** Current PnL percent */
  pnlPercent?: number;
  /** Current PnL dollars */
  pnlDollars?: number;
  /** Historical prices to pre-populate chart (optional) */
  historicalPrices?: HistoricalPrice[];
}

// Chart behavior constants
const SCROLL_DURATION = 30000; // 30 seconds of history visible
const POINT_INTERVAL = 50; // More frequent points = smoother curves
const MIN_POINTS = 2;

// Smoothing - VERY heavy smoothing for super curvy lines like speedtrading.exchange
// This makes price changes appear as flowing curves, not sharp corners
const PRICE_SMOOTHING = 0.03; // Even slower price interpolation = ultra fluid (reduced from 0.04)
const Y_SMOOTHING = 0.05; // Slower Y movement = rounder curves (reduced from 0.06)  

// Y-axis SMOOTH scaling (like speedtrading.exchange)
// Scale UP aggressively when volatility is low - make small movements dramatic
// Scale DOWN smoothly when volatility increases to fit price swings
const MIN_PRICE_RANGE_PERCENT = 0.00004; // ULTRA tight range = small moves look like big waves
const SCALE_PADDING = 0.12; // 12% padding for better vertical 'breath'
const SCALE_SMOOTHING = 0.04; // Even smoother scale transitions

// Static padding values
const PADDING_TOP = 20;
const PADDING_BOTTOM = 40;
const PADDING_LEFT = 10;
const RIGHT_GAP_PERCENT = 0.25;

// Grid constants - 10x10 grid (10 horizontal bands, 10 vertical divisions)
const GRID_LABEL_COUNT = 10;
const VERTICAL_GRID_DIVISIONS = 10;

// Safe zone constants - keep price within 6 grid bands (lines 2-7, 0-indexed)
// Top 2 bands (lines 0-1) and bottom 2 bands (lines 8-9) are reserved buffers - price cannot reach
const SAFE_ZONE_TOP_LINE = 2; // 3rd grid line (0-indexed) - top border of safe zone
const SAFE_ZONE_BOTTOM_LINE = 7; // 8th grid line (0-indexed) - bottom border of safe zone (can reach border of 9th grid)
const WARNING_TOP_LINE = 1; // 2nd grid line - price should not go above this
const WARNING_BOTTOM_LINE = 8; // 9th grid line - price should not go below this

// Color constants
const LINE_COLOR = "#00F5A0";
const GLOW_COLOR = "rgba(0, 245, 160, 0.5)";

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

// Animated rolling number digit component
function RollingDigit({ digit, color = "#0A0A0A" }: { digit: string; color?: string }) {
  const isNumber = /[0-9]/.test(digit);

  if (!isNumber) {
    return (
      <span
        className="inline-block font-mono font-bold"
        style={{ color }}
      >
        {digit}
      </span>
    );
  }

  const numValue = parseInt(digit, 10);

  return (
    <span
      className="inline-block relative overflow-hidden font-mono font-bold"
      style={{ height: "1.2em", width: "0.6em", color }}
    >
      <span
        className="absolute left-0 right-0 flex flex-col items-center transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(-${numValue * 1.2}em)`,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} style={{ height: "1.2em", lineHeight: "1.2em" }}>
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

// Animated price display with rolling numbers
function AnimatedPrice({
  value,
  precision = 6,
  color = "#0A0A0A",
  className = ""
}: {
  value: number;
  precision?: number;
  color?: string;
  className?: string;
}) {
  const displayValue = value.toPrecision(precision);

  return (
    <span className={`inline-flex tabular-nums ${className}`}>
      {displayValue.split("").map((char, i) => (
        <RollingDigit key={i} digit={char} color={color} />
      ))}
    </span>
  );
}

interface LinePoint {
  x: number;
  y: number;
  price: number; // Store price for min/max calculation
}

// Smooth curve generation with controlled tension to prevent artifacts during rescaling
function generatePathFromPoints(points: LinePoint[]): string {
  if (points.length < 2) return "";

  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  // Higher tension for ultra-smooth organic curves (0.5 creates smoother, more flowing curves)
  const tension = 0.5;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Calculate control points
    let cp1x = p1.x + (p2.x - p0.x) * tension;
    let cp1y = p1.y + (p2.y - p0.y) * tension;
    let cp2x = p2.x - (p3.x - p1.x) * tension;
    let cp2y = p2.y - (p3.y - p1.y) * tension;

    // MANDATORY: Clamp X coordinates to segment boundaries [p1.x, p2.x]
    // This prevents the path from ever looping backwards in time
    const segmentWidth = p2.x - p1.x;
    cp1x = Math.max(p1.x, Math.min(p1.x + segmentWidth * 0.5, cp1x));
    cp2x = Math.min(p2.x, Math.max(p2.x - segmentWidth * 0.5, cp2x));

    // Clamp Y control points to prevent wild vertical loops during volatility
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    const yRange = Math.abs(p2.y - p1.y);
    const maxOvershoot = Math.max(yRange * 0.3, 5);

    cp1y = Math.max(minY - maxOvershoot, Math.min(maxY + maxOvershoot, cp1y));
    cp2y = Math.max(minY - maxOvershoot, Math.min(maxY + maxOvershoot, cp2y));

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

function generateAreaFromPath(
  linePath: string,
  points: LinePoint[],
  height: number,
  paddingBottom: number,
  paddingLeft: number
): string {
  if (!linePath || points.length < 2) return "";

  const lastX = points[points.length - 1].x;
  // Use padding left as the leftmost point to avoid gaps
  const firstX = Math.max(points[0].x, paddingLeft);
  const bottomY = height - paddingBottom;

  return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
}

// Calculate nice round grid levels (divisible by 5)
function calculateNiceGridLevels(min: number, max: number, count: number): number[] {
  if (min >= max || count <= 0) return [];

  const range = max - min;
  const rawStep = range / count;

  // Find nice step size - prefer steps divisible by 5
  // For crypto prices, we want steps like 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;

  let niceStep: number;
  if (normalized <= 0.5) niceStep = 0.5;
  else if (normalized <= 1) niceStep = 1;
  else if (normalized <= 2.5) niceStep = 2.5;
  else if (normalized <= 5) niceStep = 5;
  else niceStep = 10;

  niceStep *= magnitude;

  // Ensure minimum step for readability
  if (niceStep < 0.001) niceStep = 0.001;

  // Generate levels starting from a nice round number
  const start = Math.ceil(min / niceStep) * niceStep;
  const levels: number[] = [];

  for (let level = start; level <= max + niceStep; level += niceStep) {
    // Round to avoid floating point errors
    const rounded = Math.round(level * 100000) / 100000;
    levels.push(rounded);
    if (levels.length >= count + 2) break;
  }

  return levels;
}

export function LiveLineChart({
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
}: LiveLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linePathRef = useRef<SVGPathElement>(null);
  const areaPathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const dotGroupRef = useRef<SVGGElement>(null);
  const priceLabelRef = useRef<HTMLDivElement>(null);
  const outerGlowRef = useRef<SVGCircleElement>(null);
  const gridGroupRef = useRef<SVGGElement>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [isReady, setIsReady] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [gridLevels, setGridLevels] = useState<number[]>([]);

  // Animation state refs
  const pointsRef = useRef<LinePoint[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const lastPointTimeRef = useRef<number>(0);

  // Price tracking
  const targetPriceRef = useRef<number>(0);
  const smoothedPriceRef = useRef<number>(0);
  const displayPriceRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const glowIntensityRef = useRef<number>(0);

  // Dynamic Y-axis scaling based on visible min/max
  const currentMinPriceRef = useRef<number>(0);
  const currentMaxPriceRef = useRef<number>(0);
  const targetMinPriceRef = useRef<number>(0);
  const targetMaxPriceRef = useRef<number>(0);
  const lastPriceRef = useRef<number>(0); // Track last price to detect drastic changes

  // For smooth price display updates
  const lastDisplayUpdateRef = useRef<number>(0);
  const lastGridUpdateRef = useRef<number>(0);
  const gridLevelsRef = useRef<number[]>([]);

  const rightGap = Math.max(dimensions.width * RIGHT_GAP_PERCENT, 100);
  const { width, height } = dimensions;
  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const chartWidth = width - PADDING_LEFT - rightGap;
  const scrollSpeed = chartWidth / SCROLL_DURATION;

  // Position state
  const hasPosition = entryPrice && entryPrice > 0;
  const isWinning = hasPosition && (
    (positionDirection === "long" && livePrice > entryPrice) ||
    (positionDirection === "short" && livePrice < entryPrice)
  );

  // Convert price to Y coordinate based on current scale
  const priceToY = useCallback((price: number, minPrice: number, maxPrice: number): number => {
    if (maxPrice <= minPrice || minPrice === 0) {
      return PADDING_TOP + chartHeight / 2;
    }

    const range = maxPrice - minPrice;
    const normalized = (price - minPrice) / range;

    // Invert Y (higher price = lower Y)
    return PADDING_TOP + chartHeight * (1 - normalized);
  }, [chartHeight]);

  // Handle dimension changes - use ResizeObserver to detect container changes (not just window resize)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let prevWidth = 0;

    const updateDimensions = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      if (newWidth > 0 && newHeight > 0) {
        // If width changed, rescale the X positions of all points to fit new width
        if (prevWidth > 0 && newWidth !== prevWidth && pointsRef.current.length > 0) {
          const scale = newWidth / prevWidth;
          const newRightGap = Math.max(newWidth * RIGHT_GAP_PERCENT, 100);
          const oldRightGap = Math.max(prevWidth * RIGHT_GAP_PERCENT, 100);
          const oldHeadX = prevWidth - oldRightGap;
          const newHeadX = newWidth - newRightGap;

          // Rescale all point X positions relative to the head position
          pointsRef.current = pointsRef.current.map(p => ({
            ...p,
            x: newHeadX - (oldHeadX - p.x) * scale,
          }));
        }

        prevWidth = newWidth;
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    // Initial dimensions
    updateDimensions();

    // Use ResizeObserver for container size changes (panel expand/collapse)
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    // Also listen to window resize as fallback
    window.addEventListener("resize", updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Reset when symbol changes
  useEffect(() => {
    pointsRef.current = [];
    currentYRef.current = height / 2;
    targetPriceRef.current = 0;
    smoothedPriceRef.current = 0;
    displayPriceRef.current = 0;
    lastPointTimeRef.current = 0;
    lastFrameTimeRef.current = 0;
    currentMinPriceRef.current = 0;
    currentMaxPriceRef.current = 0;
    targetMinPriceRef.current = 0;
    targetMaxPriceRef.current = 0;
    setDisplayPrice(0);
    setGridLevels([]);
    setIsReady(false);
  }, [symbol, height]);

  // Pre-populate with historical prices
  useEffect(() => {
    if (historicalPrices.length === 0 || !width || !height) return;
    if (pointsRef.current.length > 0) return; // Already populated

    const headX = width - rightGap;
    const now = Date.now();

    // Get recent prices within our scroll window
    const windowStart = now - SCROLL_DURATION;
    const recentPrices = historicalPrices.filter(p => p.time >= windowStart);

    if (recentPrices.length === 0) return;

    // Calculate min/max from historical prices
    const prices = recentPrices.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const padding = Math.max(range * SCALE_PADDING, maxPrice * MIN_PRICE_RANGE_PERCENT);

    targetMinPriceRef.current = minPrice - padding;
    targetMaxPriceRef.current = maxPrice + padding;
    currentMinPriceRef.current = targetMinPriceRef.current;
    currentMaxPriceRef.current = targetMaxPriceRef.current;

    // Initialize display price
    const latestPrice = recentPrices[recentPrices.length - 1].price;
    smoothedPriceRef.current = latestPrice;
    displayPriceRef.current = latestPrice;
    targetPriceRef.current = latestPrice;
    setDisplayPrice(latestPrice);

    // Convert historical prices to chart points
    const points = recentPrices.map(p => {
      const age = now - p.time;
      const x = headX - (age / SCROLL_DURATION) * chartWidth;
      const y = priceToY(p.price, currentMinPriceRef.current, currentMaxPriceRef.current);
      return { x, y, price: p.price };
    }).filter(p => p.x >= PADDING_LEFT - 200);

    // Ensure line extends all the way to left edge (no blank space)
    if (points.length > 0) {
      const firstPoint = points[0];
      const leftEdge = PADDING_LEFT - 300; // Extend well beyond visible left
      // Add points extending to left edge at the same price level
      for (let x = firstPoint.x - 30; x >= leftEdge; x -= 30) {
        points.unshift({ x, y: firstPoint.y, price: firstPoint.price });
      }
    }

    if (points.length >= MIN_POINTS) {
      pointsRef.current = points;
      currentYRef.current = points[points.length - 1].y;

      // Calculate initial grid levels
      const levels = calculateNiceGridLevels(
        currentMinPriceRef.current,
        currentMaxPriceRef.current,
        GRID_LABEL_COUNT
      );
      setGridLevels(levels);

      setIsReady(true);
    }
  }, [historicalPrices, width, height, rightGap, chartWidth, priceToY]);

  // Handle price updates
  useEffect(() => {
    if (livePrice <= 0) return;

    const headX = width - rightGap;

    // Initialize on first price - create a straight line
    if (currentMinPriceRef.current === 0) {
      const padding = livePrice * MIN_PRICE_RANGE_PERCENT;
      currentMinPriceRef.current = livePrice - padding;
      currentMaxPriceRef.current = livePrice + padding;
      targetMinPriceRef.current = currentMinPriceRef.current;
      targetMaxPriceRef.current = currentMaxPriceRef.current;
      smoothedPriceRef.current = livePrice;
      displayPriceRef.current = livePrice;
      setDisplayPrice(livePrice);

      // If no historical data, create initial straight line spanning full width
      if (pointsRef.current.length === 0 && chartWidth > 0) {
        const y = priceToY(livePrice, currentMinPriceRef.current, currentMaxPriceRef.current);
        currentYRef.current = y;

        // Create points from left edge (with buffer) to head position
        const headX = width - rightGap;
        const startX = PADDING_LEFT - 300; // Start well off-screen for no blank space
        const numInitialPoints = 50; // More points for smoother curves

        for (let i = 0; i < numInitialPoints; i++) {
          const t = i / (numInitialPoints - 1);
          const x = startX + (headX - startX) * t;
          pointsRef.current.push({ x, y, price: livePrice });
        }

        // Calculate initial grid levels
        const levels = calculateNiceGridLevels(
          currentMinPriceRef.current,
          currentMaxPriceRef.current,
          GRID_LABEL_COUNT
        );
        setGridLevels(levels);
      }
    }

    // Glow effect
    if (targetPriceRef.current > 0 && livePrice !== targetPriceRef.current) {
      glowIntensityRef.current = Math.min(glowIntensityRef.current + 0.2, 1);
    }

    targetPriceRef.current = livePrice;

    if (!isReady && livePrice > 0) {
      setIsReady(true);
    }
  }, [livePrice, isReady, width, rightGap, chartWidth, priceToY]);

  // Main animation loop
  useEffect(() => {
    if (!isReady) return;

    let isRunning = true;
    const headX = width - rightGap;

    const animate = (timestamp: number) => {
      if (!isRunning) return;

      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = timestamp;
        lastPointTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      // Multi-layer exponential smoothing for ultra-fluid organic curves
      // This eliminates angular 'steppy' jumps and creates gliding movements
      const dp1 = targetPriceRef.current - smoothedPriceRef.current;
      smoothedPriceRef.current += dp1 * 0.08; // Layer 1: Raw target tracking (reduced from 0.1 for smoother)

      const dp2 = smoothedPriceRef.current - displayPriceRef.current;
      displayPriceRef.current += dp2 * 0.05; // Layer 2: Transition smoothing (reduced from 0.06 for smoother)

      // Layer 3: Micro-volatility injection (The 'Wavy' Secret)
      // Adds a tiny, high-frequency wave to the display price to keep it organic 
      // even when the price is static.
      const waveFreq = timestamp * 0.0015; // Slower wave frequency for smoother motion
      const microVolatility = Math.sin(waveFreq) * (targetPriceRef.current * 0.0000015); // Reduced amplitude
      const wavyPrice = displayPriceRef.current + microVolatility;

      // Update React state for animated display (throttled)
      if (timestamp - lastDisplayUpdateRef.current > 60) {
        lastDisplayUpdateRef.current = timestamp;
        setDisplayPrice(wavyPrice);
      }

      // SMOOTH RESCALE: Calculate target min/max and smoothly interpolate
      // This creates nice curvy charts like reference sites
      // IMPORTANT: Calculate bounds BEFORE displaying price to prevent spikes from going outside
      if (pointsRef.current.length > 0) {
        // Get ALL visible prices (including historical points)
        const allPrices = pointsRef.current.map(p => p.price);
        allPrices.push(wavyPrice); // Include current price

        const dataMin = Math.min(...allPrices);
        const dataMax = Math.max(...allPrices);
        const dataRange = dataMax - dataMin;

        // Calculate safe zone dimensions
        const horizontalSpacing = height / GRID_LABEL_COUNT;
        const safeZoneTopY = PADDING_TOP + SAFE_ZONE_TOP_LINE * horizontalSpacing;
        const safeZoneBottomY = PADDING_TOP + SAFE_ZONE_BOTTOM_LINE * horizontalSpacing;
        const safeZoneHeight = safeZoneBottomY - safeZoneTopY;
        const chartHeightForCalc = height - PADDING_TOP - PADDING_BOTTOM;

        // RULE 1: ALL visible prices (including past) must be within 6 grid bands (lines 2-7)
        // RULE 2: Top 2 bands (lines 0-1) and bottom 2 bands (lines 8-9) cannot be reached
        // RULE 3: If price movement is high, scale down (widen range) to fit within safe zone
        // RULE 4: If price is not volatile, scale up (tighten range) to show movements more dynamically
        
        // The safe zone is 6 grid bands (lines 2-7), which is 60% of chart height
        const safeZoneRatio = safeZoneHeight / chartHeightForCalc;
        
        // Calculate minimum range needed to fit all data within safe zone
        const minRange = dataMax * MIN_PRICE_RANGE_PERCENT;
        const actualRange = Math.max(dataRange, minRange);
        
        // Determine if we should scale up (low volatility) or scale down (high volatility)
        // Scale up: When volatility is low, tighten range to make movements more dynamic
        // Scale down: When volatility is high, widen range to fit everything
        
        // Calculate the price range needed to fit ALL data within the safe zone
        const requiredRangeForFit = actualRange / safeZoneRatio;
        
        // For low volatility: scale up (tighten) to make movements more dynamic
        // Use a tighter range when volatility is low, but still respect safe zone
        const volatilityRatio = dataRange / (dataMax * 0.01); // Compare to 1% of price
        const isLowVolatility = volatilityRatio < 0.5; // Low volatility threshold
        
        let finalRange: number;
        if (isLowVolatility && actualRange < requiredRangeForFit) {
          // Low volatility: scale up (tighten range) but ensure it fits in safe zone
          // Use a tighter range that's still within safe zone bounds
          const tightRange = actualRange * 1.5; // Scale up by 1.5x for more dynamic view
          finalRange = Math.max(tightRange, minRange);
          // Ensure it doesn't exceed what fits in safe zone
          finalRange = Math.min(finalRange, requiredRangeForFit);
        } else {
          // High volatility or normal: scale down (widen range) to fit everything
          finalRange = Math.max(requiredRangeForFit, minRange);
        }
        
        // Center the range around the data center to ensure all prices fit
        const dataCenter = (dataMin + dataMax) / 2;
        
        // Set target bounds to fit ALL prices within safe zone
        targetMinPriceRef.current = dataCenter - finalRange / 2;
        targetMaxPriceRef.current = dataCenter + finalRange / 2;

        // Verify ALL prices are within safe zone - check min and max prices
        // This ensures we resize BEFORE showing the price tick
        const pricePerPixel = finalRange / chartHeightForCalc;
        
        const minPriceY = priceToY(dataMin, targetMinPriceRef.current, targetMaxPriceRef.current);
        const maxPriceY = priceToY(dataMax, targetMinPriceRef.current, targetMaxPriceRef.current);
        const currentPriceY = priceToY(wavyPrice, targetMinPriceRef.current, targetMaxPriceRef.current);

        // If any price is outside safe zone, adjust bounds to fit everything
        let needsAdjustment = false;
        let adjustment = 0;

        // Check if max price (highest point) is above safe zone top
        if (maxPriceY < safeZoneTopY) {
          const excessY = safeZoneTopY - maxPriceY;
          const excessPrice = excessY * pricePerPixel;
          adjustment = Math.max(adjustment, excessPrice);
          needsAdjustment = true;
        }

        // Check if min price (lowest point) is below safe zone bottom
        if (minPriceY > safeZoneBottomY) {
          const excessY = minPriceY - safeZoneBottomY;
          const excessPrice = excessY * pricePerPixel;
          adjustment = Math.max(adjustment, excessPrice);
          needsAdjustment = true;
        }

        // If adjustment needed, widen the range further to fit everything
        // This happens BEFORE we display the price, preventing spikes from going outside
        if (needsAdjustment) {
          const adjustedRange = finalRange + (adjustment * 2); // Add padding on both sides
          targetMinPriceRef.current = dataCenter - adjustedRange / 2;
          targetMaxPriceRef.current = dataCenter + adjustedRange / 2;
        }

        // Initialize current bounds if not set
        if (currentMinPriceRef.current === 0 || currentMaxPriceRef.current === 0) {
          currentMinPriceRef.current = targetMinPriceRef.current;
          currentMaxPriceRef.current = targetMaxPriceRef.current;
        }

        // Detect drastic price changes - if price moved significantly, instantly rescale
        const priceChangePercent = lastPriceRef.current > 0 
          ? Math.abs((wavyPrice - lastPriceRef.current) / lastPriceRef.current)
          : 0;
        const isDrasticChange = priceChangePercent > 0.01; // 1% change threshold for drastic movement

        // Check if current price would be outside safe zone with current bounds
        const currentPriceYWithCurrentBounds = priceToY(wavyPrice, currentMinPriceRef.current, currentMaxPriceRef.current);
        const wouldBeOutside = currentPriceYWithCurrentBounds < safeZoneTopY || currentPriceYWithCurrentBounds > safeZoneBottomY;

        // If drastic change OR price would be outside safe zone, instantly rescale (no smoothing)
        if (isDrasticChange || wouldBeOutside) {
          // Instantly apply target bounds for drastic changes
          currentMinPriceRef.current = targetMinPriceRef.current;
          currentMaxPriceRef.current = targetMaxPriceRef.current;
        } else {
          // Smoothly interpolate current bounds toward target (creates smooth scale transitions)
          // Lower SCALE_SMOOTHING = slower/smoother transitions (~1 second)
          // IMPORTANT: Apply bounds BEFORE calculating Y positions to prevent spikes from going outside
          const minDiff = targetMinPriceRef.current - currentMinPriceRef.current;
          const maxDiff = targetMaxPriceRef.current - currentMaxPriceRef.current;

          currentMinPriceRef.current += minDiff * SCALE_SMOOTHING;
          currentMaxPriceRef.current += maxDiff * SCALE_SMOOTHING;
        }
        
        // Final safety check: Ensure bounds are valid before using them
        if (currentMinPriceRef.current >= currentMaxPriceRef.current) {
          currentMinPriceRef.current = targetMinPriceRef.current;
          currentMaxPriceRef.current = targetMaxPriceRef.current;
        }

        // Update last price for next frame's drastic change detection
        lastPriceRef.current = wavyPrice;

        // Update grid levels - throttle to prevent excessive re-renders
        const timeSinceGridUpdate = timestamp - lastGridUpdateRef.current;
        if (timeSinceGridUpdate > 100) { // Update every 100ms to keep up with price
          const levels = calculateNiceGridLevels(
            currentMinPriceRef.current,
            currentMaxPriceRef.current,
            GRID_LABEL_COUNT
          );

          // Only update React state if levels actually changed (use ref for comparison)
          const prevLevels = gridLevelsRef.current;
          const levelsChanged = levels.length !== prevLevels.length ||
            levels.some((l, i) => Math.abs(l - (prevLevels[i] || 0)) > 0.0001);

          if (levelsChanged) {
            gridLevelsRef.current = levels;
            lastGridUpdateRef.current = timestamp;
            setGridLevels(levels);
          }
        }
      }

      // Calculate target Y based on current wavy price and scale
      const targetY = priceToY(wavyPrice, currentMinPriceRef.current, currentMaxPriceRef.current);

      // Transition the current Y to the target Y with low pass filtering
      const dy = targetY - currentYRef.current;
      const maxYChangePerFrame = 0.8; // Reduced from 1.0 for smoother, more controlled movement
      const clampedDy = Math.max(-maxYChangePerFrame, Math.min(maxYChangePerFrame, dy * Y_SMOOTHING));
      currentYRef.current += clampedDy;

      // Decay glow
      if (glowIntensityRef.current > 0) {
        glowIntensityRef.current *= 0.95;
        if (glowIntensityRef.current < 0.01) glowIntensityRef.current = 0;
      }

      // Scroll points left
      const scrollAmount = scrollSpeed * deltaTime;
      pointsRef.current.forEach(p => {
        p.x -= scrollAmount;
      });

      // Remove points that are off-screen left (keep some buffer for smooth curves)
      pointsRef.current = pointsRef.current.filter(p => p.x >= PADDING_LEFT - 100);

      // Add new point
      if (timestamp - lastPointTimeRef.current >= POINT_INTERVAL) {
        lastPointTimeRef.current = timestamp;
        pointsRef.current.push({
          x: headX,
          y: currentYRef.current,
          price: wavyPrice, // Store the wavy position for the next path generation
        });
      }

      // Recalculate Y positions for all points based on current scale
      pointsRef.current.forEach(p => {
        p.y = priceToY(p.price, currentMinPriceRef.current, currentMaxPriceRef.current);
      });

      // Update paths
      if (pointsRef.current.length >= MIN_POINTS) {
        const linePath = generatePathFromPoints(pointsRef.current);
        const areaPath = generateAreaFromPath(linePath, pointsRef.current, height, PADDING_BOTTOM, PADDING_LEFT);

        if (linePathRef.current) {
          linePathRef.current.setAttribute("d", linePath);
        }
        if (glowPathRef.current) {
          glowPathRef.current.setAttribute("d", linePath);
        }
        if (areaPathRef.current) {
          areaPathRef.current.setAttribute("d", areaPath);
        }
      }

      // Update current Y for head position
      if (pointsRef.current.length > 0) {
        currentYRef.current = pointsRef.current[pointsRef.current.length - 1].y;
      }

      // Update dot position
      if (dotGroupRef.current) {
        dotGroupRef.current.style.transform = `translate(${headX}px, ${currentYRef.current}px)`;
      }

      // Update price label position
      if (priceLabelRef.current) {
        priceLabelRef.current.style.top = `${currentYRef.current - 14}px`;
      }

      // Update headlight glow
      if (outerGlowRef.current) {
        const baseOpacity = 0.2;
        const glowOpacity = baseOpacity + glowIntensityRef.current * 0.3;
        const baseRadius = 5;
        const glowRadius = baseRadius + glowIntensityRef.current * 3;

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
  }, [isReady, width, height, rightGap, scrollSpeed, priceToY, chartHeight]);

  if (!isReady) {
    return (
      <div ref={containerRef} className="w-full h-full relative bg-transparent flex items-center justify-center">
        <div className="text-[var(--text-tertiary)] text-sm animate-pulse">Waiting for price data...</div>
      </div>
    );
  }

  const initialY = currentYRef.current || height / 2;
  const isPositiveChange = pnlPercent >= 0;

  // Dynamic line color
  const lineColor = hasPosition
    ? (isWinning ? "#00FF66" : "#FF3B69")
    : LINE_COLOR;
  const glowColor = hasPosition
    ? (isWinning ? "rgba(0, 255, 102, 0.5)" : "rgba(255, 59, 105, 0.5)")
    : GLOW_COLOR;

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-transparent overflow-hidden"
    >
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="areaGradientLive" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.12" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>

          <filter id="lineGlowLive" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="headGlowLive" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip path to prevent rendering outside chart area */}
          <clipPath id="chartClipLive">
            <rect x={PADDING_LEFT} y={0} width={width - PADDING_LEFT} height={height} />
          </clipPath>
        </defs>

        {/* 10x10 Grid - Always 10 horizontal lines + 10 vertical lines, evenly spaced, covering ENTIRE SVG area */}
        <g ref={gridGroupRef}>
          {/* Horizontal grid lines (always 10, evenly spaced by height - covers full SVG height) */}
          {(() => {
            // Grid covers ENTIRE SVG area from 0 to width, 0 to height
            const horizontalSpacing = height / GRID_LABEL_COUNT;
            const horizontalLines: React.ReactElement[] = [];
            
            // Generate 11 lines (0 to 10) to create 10 bands covering full SVG height
            for (let i = 0; i <= GRID_LABEL_COUNT; i++) {
              const y = i * horizontalSpacing;
              
              horizontalLines.push(
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              );
            }
            
            return horizontalLines;
          })()}
          
          {/* Vertical grid lines (always 10, evenly spaced by width - covers full SVG width) */}
          {(() => {
            // Grid covers ENTIRE SVG area from 0 to width
            const verticalSpacing = width / VERTICAL_GRID_DIVISIONS;
            const verticalLines: React.ReactElement[] = [];
            
            // Generate 11 lines (0 to 10) to create 10 bands covering full SVG width
            for (let i = 0; i <= VERTICAL_GRID_DIVISIONS; i++) {
              const x = i * verticalSpacing;
              verticalLines.push(
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={height}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              );
            }
            
            return verticalLines;
          })()}
        </g>

        {/* Price labels - Independent of grid, scale with price movement, positioned on right Y-axis */}
        {/* Labels are outside clipPath so they're always visible */}
        <g>
          {(() => {
            const minPrice = currentMinPriceRef.current;
            const maxPrice = currentMaxPriceRef.current;
            
            if (minPrice <= 0 || maxPrice <= minPrice || gridLevels.length === 0) {
              return null;
            }
            
            // Position labels on the right edge of SVG, with small margin
            const labelX = width - 10;
            
            // Use gridLevels for price labels (these are calculated based on price range)
            return gridLevels.map((price, i) => {
              const y = priceToY(price, minPrice, maxPrice);
              // Show labels that are within the SVG bounds
              if (!isFinite(y) || y < -50 || y > height + 50) return null;
              
              return (
                <text
                  key={`price-${i}`}
                  x={labelX}
                  y={y + 4}
                  fill="rgba(255, 255, 255, 0.6)"
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                  textAnchor="end"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {price >= 1000 
                    ? price.toFixed(2)
                    : price >= 100
                    ? price.toFixed(3)
                    : price >= 1
                    ? price.toFixed(4)
                    : price.toFixed(6)}
                </text>
              );
            });
          })()}
        </g>

        {/* Chart content - clipped to chart area */}
        <g clipPath="url(#chartClipLive)">
          {/* Area fill */}
          <path
            ref={areaPathRef}
            d=""
            fill="url(#areaGradientLive)"
          />

          {/* Glow line */}
          <path
            ref={glowPathRef}
            d=""
            fill="none"
            stroke={lineColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.15"
            filter="url(#lineGlowLive)"
          />

          {/* Main line */}
          <path
            ref={linePathRef}
            d=""
            fill="none"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Headlight dot */}
        <g
          ref={dotGroupRef}
          style={{ transform: `translate(${width - rightGap}px, ${initialY}px)` }}
          filter="url(#headGlowLive)"
        >
          <circle
            ref={outerGlowRef}
            r="5"
            fill={lineColor}
            opacity="0.2"
          />
          <circle r="3" fill={lineColor} />
          <circle r="1.5" fill="#FFFFFF" opacity="0.9" />
        </g>
      </svg>

      {/* Floating price label - shows position details when open, otherwise just price */}
      <div
        ref={priceLabelRef}
        className="absolute flex items-center gap-2 z-20 pointer-events-none"
        style={{
          right: rightGap - 80,
          top: initialY - 14,
        }}
      >
        {hasPosition ? (
          /* Position open: show PnL badge with animated numbers and asset icon */
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: isPositiveChange ? "#00FF66" : "#FF3B69",
              boxShadow: isPositiveChange
                ? "0 0 15px rgba(0, 255, 102, 0.5)"
                : "0 0 15px rgba(255, 59, 105, 0.5)",
            }}
          >
            {/* Asset icon for the position */}
            {tokenImage ? (
              <img
                src={tokenImage}
                alt={tokenSymbol || "Token"}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : tokenColor ? (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: tokenColor }}
              >
                <span className="text-[7px] font-bold text-white">{tokenSymbol?.[0] || "?"}</span>
              </div>
            ) : (
              <SolanaLogo className="w-4 h-4" />
            )}
            <span className="text-lg font-black font-mono tabular-nums text-[#0A0A0A]">
              {isPositiveChange ? "+" : ""}{pnlPercent.toFixed(2)}%
            </span>
            <span className="text-sm font-bold font-mono text-[#0A0A0A] opacity-80">
              {isPositiveChange ? "+" : "-"}${Math.abs(pnlDollars).toFixed(2)}
            </span>
          </div>
        ) : (
          /* No position: show animated price badge */
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: lineColor,
              boxShadow: `0 0 10px ${glowColor}`,
            }}
          >
            {tokenImage ? (
              <img
                src={tokenImage}
                alt={tokenSymbol || "Token"}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : tokenColor ? (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: tokenColor }}
              >
                <span className="text-[7px] font-bold text-white">{tokenSymbol?.[0] || "?"}</span>
              </div>
            ) : (
              <SolanaLogo className="w-4 h-4" />
            )}
            <AnimatedPrice
              value={displayPrice || livePrice}
              precision={6}
              color="#0A0A0A"
              className="text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveLineChart;
