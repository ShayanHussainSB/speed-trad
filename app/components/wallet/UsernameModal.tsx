"use client";

import { useState, useCallback } from "react";
import { X, User, Check, AlertCircle, Sparkles } from "lucide-react";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (username: string) => void;
  walletAddress: string;
}

const USERNAME_SUGGESTIONS = [
  "CryptoWhale",
  "MoonTrader",
  "DiamondHands",
  "SolanaKing",
  "SpeedRunner",
];

export function UsernameModal({
  isOpen,
  onClose,
  onSave,
  walletAddress,
}: UsernameModalProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  // All hooks must be called before any early returns
  const handleSuggestionClick = useCallback((suggestion: string) => {
    const randomNum = Math.floor(Math.random() * 9999);
    setUsername(`${suggestion}${randomNum}`);
    setError("");
  }, []);

  if (!isOpen) return null;

  const truncatedAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;

  const validateUsername = (name: string): string | null => {
    if (name.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (name.length > 20) {
      return "Username must be less than 20 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return "Only letters, numbers, and underscores allowed";
    }
    return null;
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    const validationError = validateUsername(value);
    setError(validationError || "");
  };

  const handleSubmit = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsChecking(true);
    // Simulate checking username availability
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsChecking(false);

    onSave(username);
  };

  const handleSkip = () => {
    // Generate a default username from wallet address
    onSave(`user_${walletAddress.slice(0, 8)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--accent-primary)]/30 animate-scale-in overflow-hidden" style={{ boxShadow: 'var(--shadow-modal)' }}>

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Welcome to SpeedTrad!
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                Connected: {truncatedAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">
            Choose a username to personalize your trading experience and appear on the leaderboard.
          </p>

          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
              Username
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-5 h-5 text-[var(--text-tertiary)]" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="Enter your username"
                className={`w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--bg-secondary)] border ${
                  error
                    ? "border-[var(--color-short)]"
                    : username && !error
                    ? "border-[var(--color-long)]"
                    : "border-[var(--border-subtle)]"
                } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors`}
                maxLength={20}
              />
              {username && !error && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Check className="w-5 h-5 text-[var(--color-long)]" />
                </div>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 text-[var(--color-short)] animate-slide-up">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-xs">{error}</span>
              </div>
            )}
            <p className="text-xs text-[var(--text-tertiary)]">
              {username.length}/20 characters
            </p>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
              Suggestions
            </label>
            <div className="flex flex-wrap gap-2">
              {USERNAME_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!username || !!error || isChecking}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
              !username || !!error || isChecking
                ? "bg-[var(--bg-elevated)] text-[var(--text-tertiary)] cursor-not-allowed"
                : "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)] hover:shadow-[var(--shadow-glow-pink)]"
            }`}
          >
            {isChecking ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Continue
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className="w-full py-3 rounded-xl font-medium text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

export default UsernameModal;
