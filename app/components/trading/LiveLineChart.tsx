"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
const PRICE_SMOOTHING = 0.05; // Very slow price interpolation = super smooth
const Y_SMOOTHING = 0.08; // Very slow Y movement = flowing curves  

// Y-axis SMOOTH scaling (like speedtrading.exchange)
// Scale UP aggressively when volatility is low - make small movements dramatic
// Scale DOWN smoothly when volatility increases to fit price swings
const MIN_PRICE_RANGE_PERCENT = 0.00003; // ULTRA tight 0.003% range = tiny moves fill screen
const SCALE_PADDING = 0.08; // 8% padding - very tight to maximize amplification
const SCALE_SMOOTHING = 0.05; // Smooth scale transitions

// Static padding values
const PADDING_TOP = 20;
const PADDING_BOTTOM = 40;
const PADDING_LEFT = 10;
const RIGHT_GAP_PERCENT = 0.25;

// Grid constants - match reference site which shows ~7 grid levels
const GRID_LABEL_COUNT = 7;

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

  // Higher tension for smooth organic curves (0.38 is safe for no loops)
  const tension = 0.38;

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

    // Clamp control points to prevent loops and crossing artifacts
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    const yRange = maxY - minY;
    const maxOvershoot = Math.max(yRange * 0.2, 3); // Reduced overshoot prevents loops

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

      // Triple exponential smoothing for ultra-smooth organic curves
      // Each layer makes the transitions more gradual and flowing
      const dp1 = targetPriceRef.current - smoothedPriceRef.current;
      smoothedPriceRef.current += dp1 * 0.12; // First smoothing layer

      const dp2 = smoothedPriceRef.current - displayPriceRef.current;
      displayPriceRef.current += dp2 * 0.08; // Second smoothing layer

      // Third layer: smooth the Y position even more (done when adding points)

      // Update React state for animated display (throttled)
      if (timestamp - lastDisplayUpdateRef.current > 100) {
        lastDisplayUpdateRef.current = timestamp;
        setDisplayPrice(displayPriceRef.current);
      }

      // SMOOTH RESCALE: Calculate target min/max and smoothly interpolate
      // This creates nice curvy charts like speedtrading.exchange
      if (pointsRef.current.length > 0) {
        const prices = pointsRef.current.map(p => p.price);
        const currentPrice = displayPriceRef.current;
        prices.push(currentPrice);

        const dataMin = Math.min(...prices);
        const dataMax = Math.max(...prices);
        const dataRange = dataMax - dataMin;

        // Calculate target scale bounds with padding
        // Use tighter range when volatility is low for nice curves
        const minRange = dataMax * MIN_PRICE_RANGE_PERCENT;
        const actualRange = Math.max(dataRange, minRange);
        const padding = actualRange * SCALE_PADDING;

        // Set target bounds (what we want to smoothly move toward)
        targetMinPriceRef.current = dataMin - padding;
        targetMaxPriceRef.current = dataMax + padding;

        // Initialize current bounds if not set
        if (currentMinPriceRef.current === 0 || currentMaxPriceRef.current === 0) {
          currentMinPriceRef.current = targetMinPriceRef.current;
          currentMaxPriceRef.current = targetMaxPriceRef.current;
        }

        // Smoothly interpolate current bounds toward target (creates smooth scale transitions)
        // Lower SCALE_SMOOTHING = slower/smoother transitions (~1 second)
        const minDiff = targetMinPriceRef.current - currentMinPriceRef.current;
        const maxDiff = targetMaxPriceRef.current - currentMaxPriceRef.current;

        currentMinPriceRef.current += minDiff * SCALE_SMOOTHING;
        currentMaxPriceRef.current += maxDiff * SCALE_SMOOTHING;

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

      // Calculate target Y based on current scale
      const targetY = priceToY(displayPriceRef.current, currentMinPriceRef.current, currentMaxPriceRef.current);

      // Limit max Y change per frame to force ultra-smooth curves
      const dy = targetY - currentYRef.current;
      const maxYChangePerFrame = 1.5; // Very small = no sharp corners possible
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
          price: displayPriceRef.current,
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

        {/* Dynamic Grid - recalculated based on visible price range */}
        <g ref={gridGroupRef}>
          {gridLevels.map((price, i) => {
            const y = priceToY(price, currentMinPriceRef.current, currentMaxPriceRef.current);
            const isVisible = y >= PADDING_TOP && y <= height - PADDING_BOTTOM;

            if (!isVisible) return null;

            return (
              <g key={i}>
                <line
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={width - 75}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
                <text
                  x={width - 65}
                  y={y + 4}
                  fill="#5A5A5A"
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                >
                  {price.toFixed(3)}
                </text>
              </g>
            );
          })}
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
          /* Position open: show PnL badge with animated numbers */
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: isPositiveChange ? "#00FF66" : "#FF3B69",
              boxShadow: isPositiveChange
                ? "0 0 15px rgba(0, 255, 102, 0.5)"
                : "0 0 15px rgba(255, 59, 105, 0.5)",
            }}
          >
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
