"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Search,
  Star,
  Clock,
  Flame,
  ChevronDown,
  Check,
  Sparkles,
  ArrowUpDown,
  Command,
  X,
  Coins,
  Wallet,
  Zap,
  Layers,
} from "lucide-react";

// Token data structure
export interface Token {
  symbol: string;
  name: string;
  address: string;
  icon: string; // Color for the icon
  price: number;
  change24h: number;
  volume24h: number;
  balance?: number;
  balanceUSD?: number;
  verified?: boolean;
  trending?: boolean;
}

// Mock token data - in production this would come from an API
const MOCK_TOKENS: Token[] = [
  {
    symbol: "SOL",
    name: "Solana",
    address: "So11111111111111111111111111111111111111112",
    icon: "#9945FF",
    price: 125.987,
    change24h: 2.4,
    volume24h: 2400000000,
    balance: 0.107890741,
    balanceUSD: 13.6,
    verified: true,
  },
  {
    symbol: "USDT",
    name: "USDT",
    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    icon: "#26A17B",
    price: 1.0,
    change24h: 0.05,
    volume24h: 5600000000,
    balance: 100,
    balanceUSD: 100,
    verified: true,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    icon: "#2775CA",
    price: 1.0,
    change24h: 0.0,
    volume24h: 4200000000,
    balance: 0,
    balanceUSD: 0,
    verified: true,
  },
  {
    symbol: "JLP",
    name: "Jupiter Perps",
    address: "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
    icon: "#00D18C",
    price: 3.45,
    change24h: 5.2,
    volume24h: 890000000,
    balance: 0,
    balanceUSD: 0,
    verified: true,
  },
  {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    address: "cbbtc...4iMij",
    icon: "#F7931A",
    price: 87960.1,
    change24h: 0.98,
    volume24h: 1200000000,
    balance: 0,
    balanceUSD: 0,
    verified: true,
  },
  {
    symbol: "jiUSDC",
    name: "jupiter lend USDC",
    address: "9BEcn...XPA2D",
    icon: "#2775CA",
    price: 1.02,
    change24h: 0.1,
    volume24h: 340000000,
    balance: 0,
    balanceUSD: 0,
    verified: true,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    icon: "#627EEA",
    price: 2956.77,
    change24h: 3.44,
    volume24h: 1800000000,
    balance: 0,
    balanceUSD: 0,
    verified: true,
  },
  {
    symbol: "BONK",
    name: "Bonk",
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    icon: "#FF9500",
    price: 0.00002,
    change24h: 45.2,
    volume24h: 890000000,
    balance: 0,
    balanceUSD: 0,
    verified: true,
    trending: true,
  },
  {
    symbol: "WIF",
    name: "dogwifhat",
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    icon: "#B8860B",
    price: 2.34,
    change24h: 23.5,
    volume24h: 456000000,
    balance: 0,
    balanceUSD: 0,
    verified: true,
    trending: true,
  },
  {
    symbol: "TRUMP",
    name: "OFFICIAL TRUMP",
    address: "6p6xg...fGiPN",
    icon: "#DC143C",
    price: 42.5,
    change24h: 156.3,
    volume24h: 2400000000,
    balance: 0,
    balanceUSD: 0,
    trending: true,
  },
  {
    symbol: "RENDER",
    name: "Render Token",
    address: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof",
    icon: "#FF4F4F",
    price: 7.82,
    change24h: 8.3,
    volume24h: 120000000,
    balance: 0,
    balanceUSD: 0,
    verified: true,
  },
  {
    symbol: "JTO",
    name: "Jito",
    address: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
    icon: "#00C853",
    price: 3.21,
    change24h: -2.1,
    volume24h: 89000000,
    balance: 0,
    balanceUSD: 0,
    verified: true,
  },
  {
    symbol: "PYTH",
    name: "Pyth Network",
    address: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    icon: "#6B4CE6",
    price: 0.42,
    change24h: 4.5,
    volume24h: 67000000,
    balance: 0,
    balanceUSD: 0,
    verified: true,
  },
];

type SortOption = "volume" | "change" | "name" | "balance";
type CategoryFilter = "all" | "sol" | "stables" | "memes" | "defi";

// Category definitions for filtering
const TOKEN_CATEGORIES: Record<string, CategoryFilter[]> = {
  SOL: ["sol"],
  USDT: ["stables"],
  USDC: ["stables"],
  WIF: ["memes"],
  BONK: ["memes"],
  RAY: ["defi"],
  JUP: ["defi"],
  ORCA: ["defi"],
  JTO: ["defi"],
  PYTH: ["defi"],
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTokens, setRecentTokens] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("volume");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
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
    let tokens = [...MOCK_TOKENS];

    // Filter by category
    if (categoryFilter !== "all") {
      tokens = tokens.filter((token) => {
        const categories = TOKEN_CATEGORIES[token.symbol] || [];
        return categories.includes(categoryFilter);
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const exactMatch = searchQuery.includes('"');
      const cleanQuery = query.replace(/"/g, "");

      tokens = tokens.filter((token) => {
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
    tokens.sort((a, b) => {
      switch (sortBy) {
        case "volume":
          return b.volume24h - a.volume24h;
        case "change":
          return b.change24h - a.change24h;
        case "name":
          return a.name.localeCompare(b.name);
        case "balance":
          return (b.balanceUSD || 0) - (a.balanceUSD || 0);
        default:
          return 0;
      }
    });

    return tokens;
  }, [searchQuery, sortBy, categoryFilter]);

  // Get tokens for different sections
  const favoriteTokens = useMemo(
    () => MOCK_TOKENS.filter((t) => favorites.includes(t.symbol)),
    [favorites]
  );

  const recentTokensList = useMemo(
    () => recentTokens.map((s) => MOCK_TOKENS.find((t) => t.symbol === s)).filter(Boolean) as Token[],
    [recentTokens]
  );

  const trendingTokens = useMemo(
    () => MOCK_TOKENS.filter((t) => t.trending).sort((a, b) => b.change24h - a.change24h),
    []
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

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(0)}M`;
    return `$${(volume / 1e3).toFixed(0)}K`;
  };

  const formatBalance = (balance: number, symbol: string) => {
    if (balance === 0) return `0.00 ${symbol}`;
    if (balance >= 1000) return `${balance.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${symbol}`;
    if (balance >= 1) return `${balance.toFixed(2)} ${symbol}`;
    return `${balance.toFixed(symbol === "SOL" ? 6 : 2)} ${symbol}`;
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "volume", label: "Volume" },
    { value: "change", label: "24h Change" },
    { value: "balance", label: "Balance" },
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

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {[
              { value: "all" as const, label: "All", icon: Layers },
              { value: "sol" as const, label: "SOL", icon: Coins },
              { value: "stables" as const, label: "Stables", icon: Wallet },
              { value: "memes" as const, label: "Memes", icon: Sparkles },
              { value: "defi" as const, label: "DeFi", icon: Zap },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setCategoryFilter(value)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                  whitespace-nowrap transition-all duration-150
                  ${categoryFilter === value
                    ? "bg-[var(--accent-primary)] text-white shadow-[0_0_12px_rgba(255,45,146,0.4)]"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}

            {/* Exact match hint */}
            <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap ml-auto hidden sm:block">
              Tip: Use &quot;quotes&quot; for exact match
            </span>
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
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: token.icon }}
                >
                  <span className="text-[8px] font-bold text-white">{token.symbol[0]}</span>
                </div>
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
                    formatBalance={formatBalance}
                    truncateAddress={truncateAddress}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trending Tokens */}
          {trendingTokens.length > 0 && !searchQuery && (
            <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wide">
                  Trending
                </span>
              </div>
              <div className="space-y-1">
                {trendingTokens.slice(0, 3).map((token) => (
                  <TokenRow
                    key={token.symbol}
                    token={token}
                    quoteToken={quoteToken}
                    isSelected={selectedToken?.symbol === token.symbol}
                    isFavorite={favorites.includes(token.symbol)}
                    onSelect={() => handleSelectToken(token)}
                    onToggleFavorite={(e) => toggleFavorite(token.symbol, e)}
                    formatPrice={formatPrice}
                    formatBalance={formatBalance}
                    formatVolume={formatVolume}
                    truncateAddress={truncateAddress}
                    showVolume
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Tokens Header */}
          <div className="px-4 py-3 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-card)] z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wide">
                {searchQuery ? `Results (${filteredTokens.length})` : `All Tokens (${filteredTokens.length})`}
              </span>

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
                        formatBalance={formatBalance}
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
  formatBalance: (balance: number, symbol: string) => string;
  truncateAddress: (address: string) => string;
  formatVolume?: (volume: number) => string;
  showVolume?: boolean;
  compact?: boolean;
}

function TokenRow({
  token,
  quoteToken,
  isSelected,
  isHighlighted,
  isFavorite,
  onSelect,
  onToggleFavorite,
  formatPrice,
  formatBalance,
  truncateAddress,
  formatVolume,
  showVolume,
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
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
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
          {token.trending && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00]">
              <Flame className="w-2.5 h-2.5" />
              <span className="text-[8px] font-bold">HOT</span>
            </span>
          )}
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
          {showVolume && formatVolume && (
            <span className="text-[10px] text-[var(--text-tertiary)]">
              Vol: {formatVolume(token.volume24h)}
            </span>
          )}
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
        <div className="flex items-center justify-end gap-2 mt-0.5">
          <span className="text-sm font-mono text-[var(--text-primary)]">
            {formatBalance(token.balance || 0, token.symbol)}
          </span>
          {token.balanceUSD !== undefined && token.balanceUSD > 0 && (
            <span className="text-xs text-[var(--text-tertiary)]">
              ${token.balanceUSD.toFixed(2)}
            </span>
          )}
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
