"use client";

import { NETWORK_FULL_NAME, IS_PRODUCTION } from "@/app/config/network";
import { useConnectionStatus } from "@/app/hooks/useConnectionStatus";

export function Footer() {
  const { color, isConnected } = useConnectionStatus();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 hidden md:block bg-[var(--bg-primary)]/90 backdrop-blur-xl border-t border-white/[0.08]">
      <div className="flex items-center justify-between h-6 px-4 text-[10px]">
        {/* Left - Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[var(--text-muted)] font-mono">
              {isConnected ? "WS" : "REST"}
            </span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
              <span className="text-[6px] font-bold text-white">B</span>
            </div>
            <span className="text-[var(--text-muted)]">{NETWORK_FULL_NAME}</span>
            {!IS_PRODUCTION && (
              <span className="px-1 rounded text-[8px] font-bold uppercase bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                DEV
              </span>
            )}
          </div>
        </div>

        {/* Center - Branding */}
        <span className="text-[var(--text-muted)] font-mono tracking-wide">
          updn.trade
        </span>

        {/* Right - Links */}
        <div className="flex items-center gap-3">
          <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            Docs
          </a>
          <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            Terms
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
