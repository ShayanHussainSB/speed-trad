"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SpeedGaugeProps {
  velocity: number; // 0 to 100
  label?: string;
}

export function SpeedGauge({ velocity, label = "SPEED" }: SpeedGaugeProps) {
  // Clamp velocity between 0 and 100
  const clampedVelocity = Math.min(100, Math.max(0, velocity));

  // Calculate rotation (from -135 to 135 degrees for a 270 degree arc)
  const rotation = (clampedVelocity / 100) * 270 - 135;

  // Determine color based on speed
  const getGaugeColor = (val: number) => {
    if (val > 85) return "rgb(239, 68, 68)"; // Red
    if (val > 60) return "rgb(245, 158, 11)"; // Amber
    if (val > 30) return "rgb(59, 130, 246)"; // Blue
    return "rgb(34, 211, 238)"; // Cyan
  };

  const currentColor = getGaugeColor(clampedVelocity);
  const isNitro = clampedVelocity > 90;

  return (
    <div className="relative flex flex-col items-center justify-center w-32 h-24 overflow-hidden group">
      {/* Background Arc */}
      <svg className="w-full h-full transform -rotate-0" viewBox="0 0 100 60">
        {/* Track */}
        <path
          d="M 20 50 A 35 35 0 1 1 80 50"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Dynamic Trail Glow */}
        <motion.path
          d="M 20 50 A 35 35 0 1 1 80 50"
          fill="none"
          stroke={currentColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="188.5"
          initial={{ strokeDashoffset: 188.5 }}
          animate={{
            strokeDashoffset: 188.5 - (188.5 * (clampedVelocity / 100)),
            stroke: currentColor
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          style={{ opacity: 0.3, filter: `blur(4px)` }}
        />

        {/* Dynamic Progress */}
        <motion.path
          d="M 20 50 A 35 35 0 1 1 80 50"
          fill="none"
          stroke={currentColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="188.5"
          initial={{ strokeDashoffset: 188.5 }}
          animate={{
            strokeDashoffset: 188.5 - (188.5 * (clampedVelocity / 100)),
            stroke: currentColor
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
        />

        {/* Dial Ticks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickRot = (tick / 100) * 270 - 135;
          const x2 = 50 + 38 * Math.cos(((tickRot - 90) * Math.PI) / 180);
          const y2 = 50 + 38 * Math.sin(((tickRot - 90) * Math.PI) / 180);
          const x1 = 50 + 32 * Math.cos(((tickRot - 90) * Math.PI) / 180);
          const y1 = 50 + 32 * Math.sin(((tickRot - 90) * Math.PI) / 180);
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeOpacity={tick <= clampedVelocity ? 0.6 : 0.15}
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      {/* The Needle */}
      <motion.div
        className="absolute bottom-[10px] left-1/2 w-[2px] h-[35px] origin-bottom -translate-x-1/2"
        animate={{ rotate: rotation }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
      >
        <div
          className="w-full h-full bg-gradient-to-t from-white to-transparent"
          style={{
            boxShadow: `0 0 10px ${currentColor}`,
            background: currentColor
          }}
        />
        {/* Needle Hub */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border border-black" />
      </motion.div>

      {/* Digital Readout */}
      <div className="absolute bottom-0 flex flex-col items-center">
        <motion.span
          className={`text-[10px] font-black tracking-tighter uppercase ${isNitro ? "text-red-500 animate-pulse" : "text-white/40"}`}
        >
          {isNitro ? "!! NITRO !!" : label}
        </motion.span>
        <div className="flex items-baseline gap-0.5">
          <motion.span
            className="text-lg font-black font-mono leading-none tracking-tight"
            animate={{ color: currentColor }}
          >
            {clampedVelocity.toFixed(0)}
          </motion.span>
          <span className="text-[10px] font-bold opacity-30">BPS</span>
        </div>
      </div>

      {/* Nitro Flare */}
      <AnimatePresence>
        {isNitro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-red-500/20 blur-md rotate-45" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-red-500/20 blur-md -rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
