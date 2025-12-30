"use client";

import { useState, useEffect, useMemo } from "react";

interface SpeedGaugeProps {
  // PnL as percentage (-100 to +500 typically)
  pnlPercent: number;
  // PnL in dollars
  pnlDollars: number;
  // Entry price
  entryPrice?: number;
  // Current price  
  currentPrice?: number;
  // Whether position is open
  isPositionOpen?: boolean;
  // Position direction
  direction?: "long" | "short";
  // Size variant
  size?: "normal" | "large";
}

// Map PnL percent to needle angle
// -100% → -135° (7 o'clock, liquidation)
// 0% → 0° (12 o'clock, entry)
// +500% → +135° (5 o'clock, take profit)
function pnlToAngle(pnl: number): number {
  if (pnl < 0) {
    // -100 to 0 maps to -135 to 0
    return Math.max(-135, (pnl / 100) * 135);
  } else {
    // 0 to 500 maps to 0 to 135
    return Math.min(135, (pnl / 500) * 135);
  }
}

// Get needle color based on PnL
function getNeedleColor(pnl: number): string {
  if (pnl >= 300) return "#FFD700"; // Gold
  if (pnl >= 100) return "#00FF66"; // Bright green
  if (pnl >= 0) return "#00FF66"; // Green
  if (pnl >= -25) return "#FFFFFF"; // White
  if (pnl >= -50) return "#FFA500"; // Orange
  if (pnl >= -75) return "#FF6B35"; // Red-orange
  return "#FF003C"; // Red
}

// Get glow color for needle
function getNeedleGlow(pnl: number): string {
  if (pnl >= 300) return "rgba(255, 215, 0, 0.8)";
  if (pnl >= 0) return "rgba(0, 255, 102, 0.6)";
  if (pnl >= -50) return "rgba(255, 165, 0, 0.6)";
  return "rgba(255, 0, 60, 0.8)";
}

// Get background color for PnL badge
function getPnlBgColor(pnl: number): string {
  if (pnl >= 100) return "rgba(0, 255, 102, 0.2)";
  if (pnl >= 0) return "rgba(0, 255, 102, 0.15)";
  if (pnl >= -50) return "rgba(255, 165, 0, 0.15)";
  return "rgba(255, 0, 60, 0.2)";
}

export function SpeedGauge({
  pnlPercent,
  pnlDollars,
  isPositionOpen = true,
  direction = "long",
  size: sizeVariant = "large",
}: SpeedGaugeProps) {
  // Smoothed needle angle for animation
  const [displayAngle, setDisplayAngle] = useState(0);
  const [displayPnl, setDisplayPnl] = useState(pnlPercent);
  const [mounted, setMounted] = useState(false);

  const targetAngle = useMemo(() => pnlToAngle(pnlPercent), [pnlPercent]);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Smooth needle animation
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setDisplayAngle((prev) => {
        const diff = targetAngle - prev;
        if (Math.abs(diff) < 0.5) return targetAngle;
        return prev + diff * 0.12; // slightly faster lerp
      });
      setDisplayPnl((prev) => {
        const diff = pnlPercent - prev;
        if (Math.abs(diff) < 0.1) return pnlPercent;
        return prev + diff * 0.18;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [targetAngle, pnlPercent, mounted]);

  const needleColor = getNeedleColor(displayPnl);
  const needleGlow = getNeedleGlow(displayPnl);
  const pnlBgColor = getPnlBgColor(displayPnl);

  // Determine effects based on PnL
  const isNearLiquidation = displayPnl <= -75;
  const isDanger = displayPnl <= -50 && displayPnl > -75;
  const isCritical = displayPnl <= -90;
  const isMoon = displayPnl >= 300;

  // SVG dimensions - larger size for better visibility
  const size = sizeVariant === "large" ? 240 : 180;
  const center = size / 2;
  const radius = sizeVariant === "large" ? 80 : 65;
  const innerRadius = sizeVariant === "large" ? 60 : 48;

  // Create arc path (uses svgCenter for x, center for y)
  const createArc = (
    startAngle: number,
    endAngle: number,
    r: number,
    cx: number = svgCenter,
    cy: number = center
  ): string => {
    const toSvgAngle = (clockAngle: number) => clockAngle - 90;

    const start = toSvgAngle(startAngle);
    const end = toSvgAngle(endAngle);

    const startRad = (start * Math.PI) / 180;
    const endRad = (end * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Arc segments with smoother color transitions
  // More segments = smoother gradient effect
  const arcSegments = [
    // Loss zone: Deep red → Red → Orange
    { start: -135, end: -115, color: "#FF0033" },
    { start: -115, end: -95, color: "#FF1A1A" },
    { start: -95, end: -75, color: "#FF3300" },
    { start: -75, end: -55, color: "#FF5500" },
    { start: -55, end: -35, color: "#FF7700" },
    { start: -35, end: -15, color: "#FF9900" },
    { start: -15, end: 0, color: "#FFBB00" },
    // Profit zone: Yellow → Green
    { start: 0, end: 20, color: "#FFD700" },
    { start: 20, end: 40, color: "#E5E000" },
    { start: 40, end: 60, color: "#CCFF00" },
    { start: 60, end: 80, color: "#99FF33" },
    { start: 80, end: 100, color: "#66FF44" },
    { start: 100, end: 120, color: "#33FF55" },
    { start: 120, end: 135, color: "#00FF66" },
  ];

  // Tick marks with labels (excluding -100% and +500% since LIQ and TP mark those)
  const ticksWithLabels = [
    { value: -50, label: "-50%" },
    { value: 0, label: "0%" },
    { value: 100, label: "+100%" },
    { value: 300, label: "+300%" },
  ];
  
  const tickRadius = radius + 16;
  const labelRadius = radius + 38;

  // Don't render if position not open
  if (!isPositionOpen) {
    return null;
  }

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="w-20 h-20 rounded-full border-2 border-[var(--accent-primary)] opacity-50 animate-pulse" />
      </div>
    );
  }

  // Total width including space for labels
  const totalWidth = size + 60;
  const svgCenter = totalWidth / 2;

  return (
    <div
      className={`relative select-none flex flex-col items-center ${isCritical ? "animate-pulse" : ""}`}
      style={{ width: totalWidth, height: size + 100 }}
    >
      {/* Danger vignette overlay */}
      {isNearLiquidation && (
        <div
          className="absolute rounded-full pointer-events-none animate-pulse"
          style={{
            left: (totalWidth - size) / 2,
            top: 20,
            width: size,
            height: size,
            background: `radial-gradient(circle, transparent 40%, rgba(255, 0, 60, ${isCritical ? 0.5 : 0.25}) 100%)`,
          }}
        />
      )}

      {/* Moon sparkles */}
      {isMoon && (
        <div 
          className="absolute pointer-events-none overflow-hidden rounded-full"
          style={{ left: (totalWidth - size) / 2, top: 20, width: size, height: size }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"
              style={{
                left: `${15 + (i * 10)}%`,
                top: `${15 + ((i * 8) % 50)}%`,
                animationDelay: `${i * 0.12}s`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>
      )}

      <svg
        width={totalWidth}
        height={size + 20}
        viewBox={`0 -20 ${totalWidth} ${size + 20}`}
        className="drop-shadow-2xl"
      >
        {/* Definitions */}
        <defs>
          {/* Background gradient */}
          <radialGradient id="gaugeBackground" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(26, 10, 46, 0.95)" />
            <stop offset="60%" stopColor="rgba(10, 0, 20, 0.9)" />
            <stop offset="100%" stopColor="rgba(5, 0, 8, 0.85)" />
          </radialGradient>

          {/* Needle glow filter */}
          <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Arc glow filter */}
          <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Bezel gradient */}
          <linearGradient id="bezelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FF006E" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8338EC" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Outer bezel ring */}
        <circle
          cx={svgCenter}
          cy={center}
          r={radius + 14}
          fill="none"
          stroke="url(#bezelGradient)"
          strokeWidth="2"
          opacity="0.7"
        />

        {/* Background circle */}
        <circle
          cx={svgCenter}
          cy={center}
          r={radius + 10}
          fill="url(#gaugeBackground)"
          stroke="rgba(255, 107, 53, 0.4)"
          strokeWidth="1"
        />

        {/* Arc segments - smooth continuous arc with overlap */}
        {arcSegments.map((segment, i) => {
          const isFirst = i === 0;
          const isLast = i === arcSegments.length - 1;
          // Overlap segments by 2 degrees for seamless blending
          const adjustedStart = isFirst ? segment.start : segment.start - 2;
          const adjustedEnd = isLast ? segment.end : segment.end + 2;
          
          return (
            <path
              key={i}
              d={createArc(adjustedStart, adjustedEnd, radius)}
              fill="none"
              stroke={segment.color}
              strokeWidth="14"
              strokeLinecap="butt"
              opacity="0.9"
            />
          );
        })}
        
        {/* Arc glow overlay - single glow for smooth effect */}
        <path
          d={createArc(-135, 135, radius)}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="16"
          strokeLinecap="round"
          filter="url(#arcGlow)"
        />

        {/* Inner arc track */}
        <path
          d={createArc(-135, 135, innerRadius)}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Tick marks with labels */}
        {ticksWithLabels.map(({ value, label }) => {
          const tickAngle = pnlToAngle(value);
          const svgAngleRad = tickAngle - 90;
          const rad = (svgAngleRad * Math.PI) / 180;

          const x1 = svgCenter + (radius - 4) * Math.cos(rad);
          const y1 = center + (radius - 4) * Math.sin(rad);
          const x2 = svgCenter + tickRadius * Math.cos(rad);
          const y2 = center + tickRadius * Math.sin(rad);
          
          // Label position - pushed further out
          const labelX = svgCenter + labelRadius * Math.cos(rad);
          const labelY = center + labelRadius * Math.sin(rad);
          
          // Color based on value
          const labelColor = value < 0 
            ? (value <= -50 ? "#FF6B35" : "#FFA500")
            : (value >= 300 ? "#FFD700" : "#00FF66");

          return (
            <g key={value}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <text
                x={labelX}
                y={labelY}
                fill={labelColor}
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ textShadow: `0 0 8px ${labelColor}` }}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* LIQ label at -135° (same radius as % labels) */}
        {(() => {
          const liqAngle = -135 - 90; // -135° in clock terms, converted to SVG
          const liqRad = (liqAngle * Math.PI) / 180;
          const liqX = svgCenter + labelRadius * Math.cos(liqRad);
          const liqY = center + labelRadius * Math.sin(liqRad);
          return (
            <text
              x={liqX}
              y={liqY}
              fill="#FF003C"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ textShadow: "0 0 10px rgba(255, 0, 60, 1)" }}
            >
              LIQ
            </text>
          );
        })()}

        {/* TP label at +135° (same radius as % labels) */}
        {(() => {
          const tpAngle = 135 - 90; // +135° in clock terms, converted to SVG
          const tpRad = (tpAngle * Math.PI) / 180;
          const tpX = svgCenter + labelRadius * Math.cos(tpRad);
          const tpY = center + labelRadius * Math.sin(tpRad);
          return (
            <text
              x={tpX}
              y={tpY}
              fill="#00FF66"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ textShadow: "0 0 10px rgba(0, 255, 102, 1)" }}
            >
              TP
            </text>
          );
        })()}

        {/* LIQ marker (7 o'clock) */}
        <g transform={`translate(${svgCenter - 68}, ${center + 50})`}>
          <polygon
            points="0,-8 7,0 0,8 -7,0"
            fill="#FF003C"
            filter="url(#needleGlow)"
            className={isDanger || isNearLiquidation ? "animate-pulse" : ""}
          />
        </g>

        {/* ENTRY marker (12 o'clock) */}
        <g transform={`translate(${svgCenter}, ${center - 72})`}>
          <polygon
            points="0,-8 7,0 0,8 -7,0"
            fill="#FFFFFF"
          />
        </g>

        {/* TP marker (5 o'clock) */}
        <g transform={`translate(${svgCenter + 68}, ${center + 50})`}>
          <polygon
            points="0,-8 7,0 0,8 -7,0"
            fill="#00FF66"
            filter="url(#arcGlow)"
            className={isMoon ? "animate-pulse" : ""}
          />
        </g>

        {/* Needle */}
        <g
          transform={`rotate(${displayAngle}, ${svgCenter}, ${center})`}
          filter="url(#needleGlow)"
        >
          {/* Needle shadow */}
          <line
            x1={svgCenter}
            y1={center}
            x2={svgCenter}
            y2={center - radius + 10}
            stroke="rgba(0, 0, 0, 0.6)"
            strokeWidth="5"
            strokeLinecap="round"
            transform="translate(2, 2)"
          />
          {/* Main needle */}
          <line
            x1={svgCenter}
            y1={center}
            x2={svgCenter}
            y2={center - radius + 10}
            stroke={needleColor}
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${needleGlow})`,
            }}
          />
          {/* Needle tip */}
          <circle
            cx={svgCenter}
            cy={center - radius + 10}
            r="5"
            fill={needleColor}
            style={{
              filter: `drop-shadow(0 0 10px ${needleGlow})`,
            }}
          />
        </g>

        {/* Center hub */}
        <circle
          cx={svgCenter}
          cy={center}
          r="14"
          fill="#1a0a2e"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
        />
        <circle
          cx={svgCenter}
          cy={center}
          r="7"
          fill={needleColor}
          style={{
            filter: `drop-shadow(0 0 6px ${needleGlow})`,
          }}
        />
      </svg>

      {/* Large PnL Display - Below gauge */}
      <div 
        className="absolute left-0 right-0 flex flex-col items-center"
        style={{ top: size + 15 }}
      >
        {/* Main PnL Badge */}
        <div
          className="px-4 py-2 rounded-lg backdrop-blur-sm border"
          style={{
            background: pnlBgColor,
            borderColor: needleColor,
            boxShadow: `0 0 20px ${needleGlow}, inset 0 0 10px ${needleGlow}`,
          }}
        >
          <div
            className="font-mono font-black text-2xl tracking-tight text-center"
            style={{
              color: needleColor,
              textShadow: `0 0 15px ${needleGlow}, 0 0 30px ${needleGlow}`,
            }}
          >
            {displayPnl >= 0 ? "+" : ""}
            {displayPnl.toFixed(1)}%
          </div>
          <div
            className="font-mono text-sm text-center mt-0.5"
            style={{
              color: needleColor,
              opacity: 0.9,
            }}
          >
            {pnlDollars >= 0 ? "+" : "-"}${Math.abs(pnlDollars).toFixed(2)}
          </div>
        </div>
      </div>

    </div>
  );
}

export default SpeedGauge;
