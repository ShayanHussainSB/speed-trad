"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface ReplayChartProps {
    data: { time: number; price: number }[];
    entryPrice: number;
    direction: "long" | "short";
    leverage: number;
    symbol: string;
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

const DURATION_MS = 5000; // Target replay duration: 5 seconds
const PADDING_TOP = 10;
const PADDING_BOTTOM = 10;
const GRID_BANDS = 10;
const SAFE_ZONE_TOP_BAND = 4;
const SAFE_ZONE_BOTTOM_BAND = 7;

// Visual
const LINE_WIDTH = 3;
const GLOW_BLUR = 4;
const GLOW_OPACITY = 0.2;
const DOT_RADIUS = 7;
const DOT_INNER_RADIUS = 4;

export function ReplayChart({
    data,
    entryPrice,
    direction,
    leverage,
    symbol,
}: ReplayChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const linePathRef = useRef<SVGPathElement>(null);
    const glowPathRef = useRef<SVGPathElement>(null);
    const dotRef = useRef<SVGGElement>(null);

    const [dimensions, setDimensions] = useState({ width: 600, height: 300 });
    const [isPlaying, setIsPlaying] = useState(true);
    const [replayProgress, setReplayProgress] = useState(1); // 0 to 1

    const animFrameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const pausedTimeRef = useRef<number>(0);

    // Derived data
    const { minPrice, maxPrice, timeRange, startTime } = useMemo(() => {
        if (data.length === 0) return { minPrice: 0, maxPrice: 0, timeRange: 0, startTime: 0 };
        const prices = data.map((d) => d.price);
        // Include entry price in range
        prices.push(entryPrice);

        return {
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            timeRange: data[data.length - 1].time - data[0].time,
            startTime: data[0].time,
        };
    }, [data, entryPrice]);

    // Layout constants
    const { width, height } = dimensions;
    const chartWidth = width - 60; // Right padding for labels
    const bandHeight = height / GRID_BANDS;
    const safeZoneTop = SAFE_ZONE_TOP_BAND * bandHeight;
    const safeZoneBottom = SAFE_ZONE_BOTTOM_BAND * bandHeight;
    const safeZoneHeight = safeZoneBottom - safeZoneTop;

    // Compute Y scale with buffer
    const range = maxPrice - minPrice;
    const paddedRange = range || entryPrice * 0.01; // Avoid zero range
    const scaleMin = minPrice - paddedRange * 0.2;
    const scaleMax = maxPrice + paddedRange * 0.2;

    const priceToY = useCallback(
        (price: number) => {
            if (scaleMax <= scaleMin) return safeZoneTop + safeZoneHeight / 2;
            const normalized = (price - scaleMin) / (scaleMax - scaleMin);
            return safeZoneTop + safeZoneHeight * (1 - normalized);
        },
        [scaleMin, scaleMax, safeZoneTop, safeZoneHeight]
    );

    const timeToX = useCallback(
        (time: number, maxTime: number) => {
            const progress = (time - startTime) / (maxTime - startTime);
            return Math.max(0, progress * chartWidth);
        },
        [startTime, chartWidth]
    );

    // Measure dimensions
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Animation Loop
    useEffect(() => {
        if (!isPlaying || data.length === 0) return;

        // Reset start time if just started
        if (startTimeRef.current === 0) {
            startTimeRef.current = performance.now() - (replayProgress * DURATION_MS);
        }

        const animate = (now: number) => {
            const elapsed = now - startTimeRef.current;
            const progress = Math.min(1, elapsed / DURATION_MS);

            setReplayProgress(progress);

            if (progress < 1) {
                animFrameRef.current = requestAnimationFrame(animate);
            } else {
                setIsPlaying(false);
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animFrameRef.current);
    }, [isPlaying, data.length]);

    // Handle Play/Pause toggle respecting paused time
    const togglePlay = () => {
        if (isPlaying) {
            // Pause
            cancelAnimationFrame(animFrameRef.current);
            pausedTimeRef.current = performance.now() - startTimeRef.current;
            setIsPlaying(false);
        } else {
            // Resume
            startTimeRef.current = performance.now() - pausedTimeRef.current;
            setIsPlaying(true);
        }
    };

    const resetReplay = () => {
        cancelAnimationFrame(animFrameRef.current);
        startTimeRef.current = 0;
        pausedTimeRef.current = 0;
        setReplayProgress(0);
        setIsPlaying(true);
    };

    // Render Path
    // Determine visible data based on progress
    const currentDataIndex = Math.floor(replayProgress * (data.length - 1));
    const visibleData = data.slice(0, currentDataIndex + 1);
    const lastPoint = visibleData[visibleData.length - 1];

    // Interpolate precise position
    const exactTime = startTime + (timeRange * replayProgress);
    // Find surrounding points for interpolation if needed, but for now simple slicing is "frame accurate" enough
    // effectively sampling at the recorded rate.

    if (!lastPoint) return null;

    const currentPrice = lastPoint.price;
    const isProfit = direction === "long" ? currentPrice >= entryPrice : currentPrice <= entryPrice;
    const lineColor = isProfit ? "#00FF66" : "#FF3B69"; // Green/Red

    // Build SVG Path
    let pathD = "";
    if (visibleData.length > 0) {
        // Map all points to their final X positions (we squeeze time into width)
        const mappedPoints = visibleData.map(d => ({
            x: ((d.time - startTime) / timeRange) * chartWidth,
            y: priceToY(d.price)
        }));

        // Simple polyline or curve
        if (mappedPoints.length === 1) {
            pathD = `M 0 ${priceToY(visibleData[0].price)} L ${mappedPoints[0].x} ${mappedPoints[0].y}`;
        } else {
            pathD = `M 0 ${priceToY(visibleData[0].price)} `;
            for (let i = 0; i < mappedPoints.length; i++) {
                pathD += `L ${mappedPoints[i].x} ${mappedPoints[i].y} `;
            }
        }
    }

    const currentX = (currentDataIndex / (data.length - 1)) * chartWidth; // Approximate X based on index to start
    // Better X:
    const currentExactX = replayProgress * chartWidth;
    const currentY = priceToY(currentPrice);

    // PnL calc
    const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100 * leverage * (direction === "short" ? -1 : 1);


    return (
        <div className="relative w-full h-full flex flex-col bg-[var(--bg-primary)] rounded-xl overflow-hidden border border-[var(--border-subtle)]">
            {/* Chart Canvas */}
            <div ref={containerRef} className="flex-1 relative cursor-crosshair">
                <svg width={width} height={height} className="absolute inset-0">
                    <defs>
                        <filter id="replayGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="replay-grid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--electric-purple)" stopOpacity="0" />
                            <stop offset="20%" stopColor="var(--electric-purple)" stopOpacity="0.1" />
                            <stop offset="80%" stopColor="var(--electric-purple)" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="var(--electric-purple)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid */}
                    <g>
                        {Array.from({ length: GRID_BANDS + 1 }).map((_, i) => (
                            <line
                                key={`h-${i}`}
                                x1={0}
                                y1={(height / GRID_BANDS) * i}
                                x2={width}
                                y2={(height / GRID_BANDS) * i}
                                stroke="url(#replay-grid)"
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
                                stroke="var(--electric-purple)"
                                strokeOpacity="0.1"
                                strokeWidth="1"
                            />
                        ))}
                    </g>

                    {/* Plot Line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke={lineColor}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#replayGlow)"
                    />

                    {/* Entry Line */}
                    <line
                        x1={0} y1={priceToY(entryPrice)}
                        x2={width} y2={priceToY(entryPrice)}
                        stroke="white"
                        strokeOpacity="0.3"
                        strokeDasharray="4 4"
                    />

                    {/* Head Dot */}
                    <g transform={`translate(${currentExactX}, ${currentY})`}>
                        <circle r={6} fill={lineColor} filter="url(#replayGlow)" />
                        <circle r={3} fill="white" />
                    </g>
                </svg>

                {/* HUD Overlay */}
                <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Replay Mode</span>
                        <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
                    </div>
                    <div className="text-2xl font-black font-mono tabular-nums text-white">
                        ${currentPrice.toFixed(2)}
                    </div>
                    <div className={`text-lg font-bold font-mono ${pnlPercent >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                        {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="h-12 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center px-4 gap-4">
                <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors"
                >
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </button>

                {/* Progress Bar */}
                <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden relative group cursor-pointer"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = (e.clientX - rect.left) / rect.width;
                        setReplayProgress(pct);
                        // Reset time ref so animation continues smoothly from new point
                        startTimeRef.current = performance.now() - (pct * DURATION_MS);
                        if (!isPlaying) {
                            pausedTimeRef.current = performance.now() - startTimeRef.current;
                        }
                    }}
                >
                    <div
                        className="absolute top-0 left-0 h-full bg-[var(--accent-primary)]"
                        style={{ width: `${replayProgress * 100}%` }}
                    />
                </div>

                <button
                    onClick={resetReplay}
                    className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors"
                >
                    <RotateCcw size={16} />
                </button>
            </div>
        </div>
    );
}
