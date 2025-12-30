"use client";

import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    X,
    Clock,
    Zap,
    Sparkles,
    Rocket,
    Maximize2,
    Trash2,
    Target,
    ArrowRight
} from "lucide-react";
import { Order } from "@/app/hooks/usePositions";

type OrderFilter = "all" | "limit" | "stop";

// Format time ago
const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

// Format value with compact notation
const formatValue = (value: number, decimals: number = 2): string => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 10000) return `${(value / 1000).toFixed(1)}K`;
    if (Math.abs(value) >= 1000)
        return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
    return value.toFixed(decimals);
};

interface OrdersListProps {
    isConnected: boolean;
    orders: Order[];
    onCancelOrder: (orderId: string) => void;
    onViewAll?: () => void;
    maxVisible?: number;
}

export function OrdersList({
    isConnected,
    orders,
    onCancelOrder,
    onViewAll,
    maxVisible = 2,
}: OrdersListProps) {
    const [filter, setFilter] = useState<OrderFilter>("all");

    const filteredOrders = orders.filter((o) => {
        if (filter === "all") return true;
        return o.type === filter;
    });

    const visibleOrders = filteredOrders.slice(0, maxVisible);
    const openCount = orders.filter(o => o.status === "open").length;

    if (!isConnected && orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-full py-6 px-4">
                <div className="flex items-center gap-6 opacity-60">
                    <div className="relative w-16 h-16 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                        <Clock className="w-8 h-8 text-[var(--text-tertiary)]" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-[var(--text-primary)] mb-0.5">Orders Dormant</h3>
                        <p className="text-xs text-[var(--text-tertiary)]">Connect wallet to place limit orders.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-full py-6 px-4">
                <div className="flex items-center gap-6">
                    <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 animate-pulse" />
                        <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
                            <Clock className="w-7 h-7 text-[var(--accent-primary)]" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-base font-black text-[var(--text-primary)] mb-0.5">No Open Orders</h3>
                        <p className="text-xs text-[var(--text-tertiary)] mb-3">Set limit orders to catch the next dip.</p>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
                                <Target className="w-2.5 h-2.5 text-[var(--accent-primary)]" />
                                <span className="text-[9px] font-bold text-[var(--accent-primary)]">Precision Entry</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black/40">
            {/* Control Strip - Sharp & Minimal */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-1">
                    {["all", "limit", "stop"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as OrderFilter)}
                            className={`
                                px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all
                                ${filter === f
                                    ? "text-white bg-white/10"
                                    : "text-white/30 hover:text-white"
                                }
                            `}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Active</span>
                        <span className="text-[13px] font-black font-mono text-[var(--accent-primary)] tracking-tighter">{openCount}</span>
                    </div>
                </div>
            </div>

            {/* Orders Feed */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {visibleOrders.map((order) => {
                        const isLong = order.direction === "long";
                        return (
                            <div
                                key={order.id}
                                className="group relative p-4 rounded bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all overflow-hidden"
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1 h-6 rounded-full ${isLong ? "bg-[var(--color-long)]" : "bg-[var(--color-short)]"}`} />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-black text-white uppercase tracking-wider">{order.symbol}</span>
                                                    <span className={`text-[8px] font-black px-1 rounded-sm border ${isLong ? "text-[var(--color-long)] border-[var(--color-long)]/30" : "text-[var(--color-short)] border-[var(--color-short)]/30"}`}>
                                                        {order.type.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onCancelOrder(order.id)}
                                            className="p-1.5 rounded text-white/20 hover:text-[var(--color-short)] hover:bg-[var(--color-short)]/10 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Trigger</span>
                                            <span className="text-[16px] font-black font-mono text-white tracking-tighter">${order.triggerPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Size</span>
                                            <span className="text-[16px] font-black font-mono text-[var(--accent-primary)] tracking-tighter">${order.size.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{order.leverage}X Leverage</span>
                                            <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">{formatTimeAgo(order.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                                            <span className="text-[9px] font-black text-[var(--accent-primary)] uppercase tracking-widest">Pending</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default OrdersList;
