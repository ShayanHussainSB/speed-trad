"use client";

import { FC, useCallback, useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { X, ExternalLink, AlertCircle, Loader2 } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export const WalletModal: FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { wallets, select, connecting, connected, wallet } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter to only show installed or loadable wallets first
  const sortedWallets = [...wallets].sort((a, b) => {
    const aInstalled = a.readyState === WalletReadyState.Installed;
    const bInstalled = b.readyState === WalletReadyState.Installed;
    if (aInstalled && !bInstalled) return -1;
    if (!aInstalled && bInstalled) return 1;
    return 0;
  });

  const handleWalletSelect = useCallback(
    async (walletName: WalletName) => {
      setSelectedWallet(walletName);
      setError(null);

      try {
        select(walletName);
      } catch (err) {
        console.error("Wallet selection error:", err);
        setError("Failed to connect wallet");
      }
    },
    [select]
  );

  // Close modal on successful connection
  useEffect(() => {
    if (connected && wallet) {
      onClose();
    }
  }, [connected, wallet, onClose]);

  // Track previous isOpen to reset on close
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    // Only reset when transitioning from open to closed
    if (prevIsOpenRef.current && !isOpen) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setSelectedWallet(null);
        setError(null);
      }, 0);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 animate-scale-in">
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Connect Wallet
              </h2>
              <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
                Select a wallet to connect
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-5 mt-4 p-3 rounded-lg bg-[var(--color-short-muted)] border border-[rgba(255,59,105,0.2)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--color-short)]" />
              <span className="text-sm text-[var(--color-short)]">{error}</span>
            </div>
          )}

          {/* Wallet List */}
          <div className="p-5 space-y-2 max-h-[400px] overflow-y-auto">
            {sortedWallets.map((walletAdapter) => {
              const isInstalled = walletAdapter.readyState === WalletReadyState.Installed;
              const isSelected = selectedWallet === walletAdapter.adapter.name;
              const isConnecting = connecting && isSelected;

              return (
                <button
                  key={walletAdapter.adapter.name}
                  onClick={() => handleWalletSelect(walletAdapter.adapter.name)}
                  disabled={connecting}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                    ${isSelected
                      ? "border-[var(--accent-primary)] bg-[var(--accent-muted)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)]"
                    }
                    ${connecting && !isSelected ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {/* Wallet Icon */}
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center overflow-hidden">
                    {walletAdapter.adapter.icon ? (
                      <img
                        src={walletAdapter.adapter.icon}
                        alt={walletAdapter.adapter.name}
                        className="w-6 h-6"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[var(--accent-muted)]" />
                    )}
                  </div>

                  {/* Wallet Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {walletAdapter.adapter.name}
                      </span>
                      {isInstalled && (
                        <span className="badge badge-long text-[10px]">Detected</span>
                      )}
                    </div>
                    {!isInstalled && (
                      <span className="text-xs text-[var(--text-tertiary)]">
                        Click to install
                      </span>
                    )}
                  </div>

                  {/* Loading/Arrow */}
                  <div className="flex-shrink-0">
                    {isConnecting ? (
                      <Loader2 className="w-5 h-5 text-[var(--accent-primary)] animate-spin" />
                    ) : !isInstalled ? (
                      <ExternalLink className="w-4 h-4 text-[var(--text-tertiary)]" />
                    ) : (
                      <svg
                        className="w-5 h-5 text-[var(--text-tertiary)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <p className="text-xs text-center text-[var(--text-tertiary)]">
              By connecting, you agree to our{" "}
              <a href="#" className="text-[var(--accent-primary)] hover:underline">
                Terms of Service
              </a>
            </p>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-[var(--accent-primary)] rounded-2xl blur-xl opacity-10 -z-10" />
      </div>
    </div>
  );
};

export default WalletModal;
