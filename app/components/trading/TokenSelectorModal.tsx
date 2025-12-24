"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Search,
  Star,
  Clock,
  ChevronDown,
  Check,
  Sparkles,
  ArrowUpDown,
  Command,
  X,
  Loader2,
} from "lucide-react";
import { useTokenList } from "@/app/hooks/useTokenList";

// Token data structure
export interface Token {
  symbol: string;
  name: string;
  address: string;
  icon: string; // Fallback color for the icon
  image?: string; // URL to token logo image
  price: number;
  change24h: number;
  volume24h: number;
  balance?: number;
  balanceUSD?: number;
  verified?: boolean;
  trending?: boolean;
}

type SortOption = "volume" | "change" | "name";

interface TokenSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
  selectedToken?: Token;
  quoteToken?: string; // e.g., "USDC" for pairs like SOL/USDC
}

const STORAGE_KEY_FAVORITES = "speedtrad_favorite_tokens";
const STORAGE_KEY_RECENT = "speedtrad_recent_tokens";

export function TokenSelectorModal({
  isOpen,
  onClose,
  onSelectToken,
  selectedToken,
  quoteToken = "USDC",
}: TokenSelectorModalProps) {
  // Get live token data from Bulk.trade API
  const { tokens: liveTokens, isLoading: tokensLoading } = useTokenList();

  // Use live tokens from Bulk.trade API
  const ALL_TOKENS = liveTokens;

  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTokens, setRecentTokens] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("volume");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const virtualListRef = useRef<HTMLDivElement>(null);

  // Load favorites and recent from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem(STORAGE_KEY_FAVORITES);
      const savedRecent = localStorage.getItem(STORAGE_KEY_RECENT);
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedRecent) setRecentTokens(JSON.parse(savedRecent));
    }
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    if (isOpen) {
      setSearchQuery("");
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredTokens.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredTokens[highlightedIndex]) {
          handleSelectToken(filteredTokens[highlightedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex]);

  // Toggle favorite
  const toggleFavorite = useCallback((symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // Add to recent tokens
  const addToRecent = useCallback((symbol: string) => {
    setRecentTokens((prev) => {
      const filtered = prev.filter((s) => s !== symbol);
      const newRecent = [symbol, ...filtered].slice(0, 5);
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(newRecent));
      return newRecent;
    });
  }, []);

  // Clear recent tokens
  const clearRecent = useCallback(() => {
    setRecentTokens([]);
    localStorage.removeItem(STORAGE_KEY_RECENT);
  }, []);

  // Handle token selection
  const handleSelectToken = useCallback((token: Token) => {
    addToRecent(token.symbol);
    onSelectToken(token);
    onClose();
  }, [addToRecent, onSelectToken, onClose]);

  // Filter and sort tokens
  const filteredTokens = useMemo(() => {
    let tokens = [...ALL_TOKENS];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const exactMatch = searchQuery.includes('"');
      const cleanQuery = query.replace(/"/g, "");

      tokens = tokens.filter((token: Token) => {
        if (exactMatch) {
          return (
            token.symbol.toLowerCase() === cleanQuery ||
            token.name.toLowerCase() === cleanQuery
          );
        }
        return (
          token.symbol.toLowerCase().includes(cleanQuery) ||
          token.name.toLowerCase().includes(cleanQuery) ||
          token.address.toLowerCase().includes(cleanQuery)
        );
      });
    }

    // Sort tokens
    tokens.sort((a: Token, b: Token) => {
      switch (sortBy) {
        case "volume":
          return b.volume24h - a.volume24h;
        case "change":
          return b.change24h - a.change24h;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return tokens;
  }, [searchQuery, sortBy, ALL_TOKENS]);

  // Get tokens for different sections
  const favoriteTokens = useMemo(
    () => ALL_TOKENS.filter((t: Token) => favorites.includes(t.symbol)),
    [favorites, ALL_TOKENS]
  );

  const recentTokensList = useMemo(
    () => recentTokens.map((s) => ALL_TOKENS.find((t: Token) => t.symbol === s)).filter(Boolean) as Token[],
    [recentTokens, ALL_TOKENS]
  );

  // Virtual list for "All Tokens" - only renders visible items
  const rowVirtualizer = useVirtualizer({
    count: filteredTokens.length,
    getScrollElement: () => virtualListRef.current,
    estimateSize: () => 64, // Estimated row height in pixels
    overscan: 5, // Render 5 extra items above/below for smooth scrolling
  });

  // Scroll highlighted item into view when using keyboard navigation
  useEffect(() => {
    if (highlightedIndex >= 0 && rowVirtualizer) {
      rowVirtualizer.scrollToIndex(highlightedIndex, { align: "auto" });
    }
  }, [highlightedIndex, rowVirtualizer]);

  // Format helpers
  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.0001) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "volume", label: "Volume" },
    { value: "change", label: "24h Change" },
    { value: "name", label: "Name" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl mx-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--accent-primary)]/30 overflow-hidden animate-scale-in"
        style={{ boxShadow: "var(--shadow-modal)", maxHeight: "80vh" }}
      >
        {/* Search Header - Enhanced Design */}
        <div className="px-4 pt-4 pb-3 space-y-3">
          {/* Search Input Box */}
          <div
            className={`
              relative flex items-center gap-3 px-4 py-3.5 rounded-xl
              bg-[var(--bg-secondary)] border-2 transition-all duration-200
              ${isSearchFocused
                ? "border-[var(--accent-primary)] shadow-[0_0_20px_rgba(255,45,146,0.15)]"
                : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
              }
            `}
          >
            <Search className={`w-5 h-5 transition-colors duration-200 ${
              isSearchFocused ? "text-[var(--accent-primary)]" : "text-[var(--text-tertiary)]"
            }`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search by name, symbol, or address..."
              className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border-none ring-0 focus:ring-0 focus:outline-none focus-visible:outline-none text-base font-medium"
              style={{ outline: 'none' }}
            />

            {/* Clear button - shows when there's text */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Keyboard shortcuts */}
            <div className="flex items-center gap-1.5">
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--bg-tertiary)] text-[10px] font-medium text-[var(--text-tertiary)]">
                <Command className="w-3 h-3" />K
              </kbd>
              <button
                onClick={onClose}
                className="px-2 py-1 rounded-md bg-[var(--bg-tertiary)] text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                Esc
              </button>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--border-subtle)]" />

        {/* Quick Access Favorites */}
        {favoriteTokens.length > 0 && !searchQuery && (
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)] overflow-x-auto scrollbar-hide">
            {favoriteTokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => handleSelectToken(token)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                  selectedToken?.symbol === token.symbol
                    ? "border-[var(--accent-primary)] bg-[var(--accent-muted)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-default)]"
                }`}
              >
                {token.image ? (
                  <img
                    src={token.image}
                    alt={token.symbol}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: token.icon }}
                  >
                    <span className="text-[8px] font-bold text-white">{token.symbol[0]}</span>
                  </div>
                )}
                <span className="text-xs font-semibold text-[var(--text-primary)]">{token.symbol}</span>
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Content */}
        <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 140px)" }}>
          {/* Recent Tokens */}
          {recentTokensList.length > 0 && !searchQuery && (
            <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wide">
                    Recently Traded
                  </span>
                </div>
                <button
                  onClick={clearRecent}
                  className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentTokensList.map((token) => (
                  <TokenRow
                    key={token.symbol}
                    token={token}
                    quoteToken={quoteToken}
                    isSelected={selectedToken?.symbol === token.symbol}
                    isFavorite={favorites.includes(token.symbol)}
                    onSelect={() => handleSelectToken(token)}
                    onToggleFavorite={(e) => toggleFavorite(token.symbol, e)}
                    formatPrice={formatPrice}
                    truncateAddress={truncateAddress}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Tokens Header */}
          <div className="px-4 py-3 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-card)] z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wide">
                  {searchQuery ? `Results (${filteredTokens.length})` : `All Tokens (${filteredTokens.length})`}
                </span>
                {tokensLoading && (
                  <Loader2 className="w-3 h-3 animate-spin text-[var(--accent-primary)]" />
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  {sortOptions.find((o) => o.value === sortBy)?.label}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showSortDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSortDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-lg min-w-[120px]">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                            sortBy === option.value
                              ? "text-[var(--accent-primary)] bg-[var(--accent-muted)]"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Virtualized Token List */}
          <div
            ref={virtualListRef}
            className="overflow-y-auto px-4"
            style={{ height: "300px" }}
          >
            {filteredTokens.length > 0 ? (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const token = filteredTokens[virtualItem.index];
                  return (
                    <div
                      key={token.symbol}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <TokenRow
                        token={token}
                        quoteToken={quoteToken}
                        isSelected={selectedToken?.symbol === token.symbol}
                        isHighlighted={virtualItem.index === highlightedIndex}
                        isFavorite={favorites.includes(token.symbol)}
                        onSelect={() => handleSelectToken(token)}
                        onToggleFavorite={(e) => toggleFavorite(token.symbol, e)}
                        formatPrice={formatPrice}
                        truncateAddress={truncateAddress}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-10 h-10 text-[var(--text-tertiary)] mb-3" />
                <p className="text-sm text-[var(--text-secondary)]">No tokens found</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Try a different search term
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Tip */}
        <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
          <div className="flex items-center gap-2 text-[10px] text-[var(--text-tertiary)]">
            <Sparkles className="w-3 h-3" />
            <span>
              Pro tip: Press{" "}
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg-tertiary)] font-mono">⌘K</kbd>{" "}
              anywhere to quickly search tokens
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Token Row Component
interface TokenRowProps {
  token: Token;
  quoteToken: string;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  formatPrice: (price: number) => string;
  truncateAddress: (address: string) => string;
  compact?: boolean;
}

function TokenRow({
  token,
  isSelected,
  isHighlighted,
  isFavorite,
  onSelect,
  onToggleFavorite,
  formatPrice,
  truncateAddress,
  compact,
}: TokenRowProps) {
  const isPositive = token.change24h >= 0;

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
        isSelected
          ? "bg-[var(--accent-muted)] border border-[var(--accent-primary)]"
          : isHighlighted
          ? "bg-[var(--bg-elevated)] border border-[var(--border-default)]"
          : "border border-transparent hover:bg-[var(--bg-secondary)]"
      }`}
    >
      {/* Token Icon */}
      <div className="relative">
        {token.image ? (
          <img
            src={token.image}
            alt={token.symbol}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              // Fallback to color circle if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${token.image ? 'hidden' : ''}`}
          style={{ background: token.icon }}
        >
          <span className="text-sm font-bold text-white">{token.symbol[0]}</span>
        </div>
        {token.verified && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--color-long)] flex items-center justify-center border-2 border-[var(--bg-card)]">
            <Check className="w-2 h-2 text-[#050505]" />
          </div>
        )}
      </div>

      {/* Token Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--text-primary)]">{token.symbol}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-tertiary)]">{token.name}</span>
          {!compact && (
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {truncateAddress(token.address)}
            </span>
          )}
        </div>
      </div>

      {/* Price & Change */}
      <div className="text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm font-mono text-[var(--text-primary)]">
            {formatPrice(token.price)}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 mt-0.5">
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              isPositive
                ? "text-[var(--color-long)] bg-[var(--color-long)]/10"
                : "text-[var(--color-short)] bg-[var(--color-short)]/10"
            }`}
          >
            {isPositive ? "+" : ""}
            {token.change24h.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Favorite Button */}
      <button
        onClick={onToggleFavorite}
        className={`p-1.5 rounded-lg transition-colors ${
          isFavorite
            ? "text-[#FFD700]"
            : "text-[var(--text-tertiary)] hover:text-[#FFD700]"
        }`}
      >
        <Star className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>
    </button>
  );
}

export default TokenSelectorModal;
