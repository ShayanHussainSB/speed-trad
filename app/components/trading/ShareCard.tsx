"use client";

import { useMemo } from "react";
import { Zap, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { ReplayChart } from "./ReplayChart";
import { TradeRecord } from "@/app/contexts/DemoTradingContext";

interface ShareCardProps {
    trade: TradeRecord;
}

export function ShareCard({ trade }: ShareCardProps) {
    const isProfit = trade.pnl >= 0;
    const pnlPercent = (trade.pnl / trade.margin) * 100;

    return (
        <div className="w-[1200px] h-[630px] bg-[#050510] relative overflow-hidden flex flex-col font-sans">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--electric-purple)]/10 blur-[150px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--accent-primary)]/10 blur-[150px]" />

            {/* Header */}
            <div className="flex items-center justify-between px-12 py-8 z-10">
                <div className="flex items-center gap-3">
                    {/* UPDN Logo Mark */}
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--warm-yellow)] to-[var(--sunset-orange)] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,107,53,0.3)]">
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-black">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black italic tracking-tighter text-white leading-none">UPDN</span>
                        <span className="text-xs font-bold tracking-widest text-white/50 uppercase">Instant Replay</span>
                    </div>
                </div>

                <div className={`px-4 py-2 rounded-full border ${isProfit ? "bg-[var(--warm-yellow)]/10 border-[var(--warm-yellow)]/30 text-[var(--warm-yellow)]" : "bg-[var(--hot-pink)]/10 border-[var(--hot-pink)]/30 text-[var(--hot-pink)]"} font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                    {isProfit ? "Victory" : "Defeat"}
                </div>
            </div>

            {/* content */}
            <div className="flex-1 flex px-12 pb-10 gap-10 items-end z-10">
                {/* Left: Stats */}
                <div className="flex flex-col gap-8 min-w-[300px]">
                    {/* Big PnL */}
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1">Total PnL</span>
                        <div className={`text-7xl font-black italic tracking-tighter ${isProfit ? "text-[var(--warm-yellow)] drop-shadow-[0_0_20px_rgba(255,190,11,0.3)]" : "text-[var(--hot-pink)] drop-shadow-[0_0_20px_rgba(255,0,110,0.3)]"}`}>
                            {isProfit ? "+" : ""}{trade.pnl.toFixed(2)}
                        </div>
                        <div className={`text-4xl font-bold font-mono mt-2 flex items-center gap-2 ${isProfit ? "text-[var(--warm-yellow)]" : "text-[var(--hot-pink)]"}`}>
                            {isProfit ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                            {pnlPercent.toFixed(2)}%
                        </div>
                    </div>

                    {/* Grid Stats */}
                    <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <div>
                            <span className="text-xs font-bold text-white/40 uppercase block mb-1">Pair</span>
                            <span className="text-xl font-bold text-white">{trade.symbol}/USD</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-white/40 uppercase block mb-1">Leverage</span>
                            <span className="text-xl font-bold text-white flex items-center gap-1">
                                <Zap className="w-4 h-4 text-[var(--warm-yellow)]" fill="currentColor" />
                                {trade.leverage}x
                            </span>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-white/40 uppercase block mb-1">Entry</span>
                            <span className="text-lg font-mono text-white/80">${trade.entryPrice.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-white/40 uppercase block mb-1">Exit</span>
                            <span className="text-lg font-mono text-white/80">${trade.exitPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Chart (Static Replay) */}
                <div className="flex-1 h-[380px] bg-[#0D0D15]/80 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
                    <div className="absolute inset-0 pointer-events-none">
                        <ReplayChart
                            data={trade.priceHistory || []}
                            entryPrice={trade.entryPrice}
                            direction={trade.direction}
                            leverage={trade.leverage}
                            symbol={trade.symbol}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
