"use client";

import { ExternalLink } from "lucide-react";
import { NETWORK_FULL_NAME, IS_PRODUCTION } from "@/app/config/network";
import { useConnectionStatus } from "@/app/hooks/useConnectionStatus";

export function Footer() {
  const { label, color, isConnected, isReconnecting } = useConnectionStatus();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-card)]/95 backdrop-blur-sm border-t border-[var(--border-subtle)] hidden md:block">
      <div className="flex items-center justify-between h-10 px-6 max-w-[1800px] mx-auto">
        {/* Left side - Status & Network */}
        <div className="flex items-center gap-6">
          {/* API Connection Status */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {isConnected && (
                <div
                  className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75"
                  style={{ backgroundColor: color }}
                />
              )}
              {isReconnecting && (
                <div
                  className="absolute inset-0 w-2 h-2 rounded-full animate-pulse opacity-75"
                  style={{ backgroundColor: color }}
                />
              )}
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {label}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)]">
              Bulk.trade
            </span>
          </div>

          {/* Separator */}
          <div className="w-px h-4 bg-[var(--border-subtle)]" />

          {/* Network */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">S</span>
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">{NETWORK_FULL_NAME}</span>
            {!IS_PRODUCTION && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#FF6B00]/20 text-[#FF6B00]">
                Test
              </span>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-4 bg-[var(--border-subtle)]" />

          {/* Connection mode indicator */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-tertiary)]">Mode:</span>
            <span
              className="text-xs font-mono"
              style={{ color: isConnected ? "var(--color-long)" : "#F59E0B" }}
            >
              {isConnected ? "WebSocket" : "REST Polling"}
            </span>
          </div>
        </div>

        {/* Center - Copyright */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-xs text-[var(--text-tertiary)]">
            © 2024 SpeedTrad. All rights reserved.
          </span>
        </div>

        {/* Right side - Links */}
        <div className="flex items-center gap-5">
          <a
            href="#"
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Docs
            <ExternalLink className="w-3 h-3" />
          </a>
          <div className="w-px h-4 bg-[var(--border-subtle)]" />
          <a
            href="#"
            className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="hidden xl:inline">Follow us</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
