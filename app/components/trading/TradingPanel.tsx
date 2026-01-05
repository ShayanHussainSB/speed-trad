"use client";

import { useState, useMemo } from "react";
import {
  Zap,
  Wallet,
  Target,
  Plus,
  ArrowDownUp,
  ChevronDown,
  Settings,
  Info,
  RefreshCw,
  FlaskConical,
  RotateCcw,
} from "lucide-react";
import { Position } from "@/app/hooks/usePositions";
import { DEMO_CONFIG } from "@/app/config/demoTrading";

type TradeDirection = "long" | "short";
type TradingMode = "perpetuals" | "spot";

interface TradingPanelProps {
  mode: TradingMode;
  isConnected: boolean;
  onConnectWallet: () => void;
  balance?: number;
  demoBalance?: number;
  currentPrice?: number;
  activePosition?: Position | null;
  onReversePosition?: (position: Position) => void;
  onOpenPosition?: (direction: TradeDirection, amount: number, leverage: number) => void;
  onResetDemo?: () => void;
  isDemoMode?: boolean;
}

interface Token {
  symbol: string;
  name: string;
  icon: React.ReactNode;
  balance: number;
  color: string;
}

const TOKENS: Token[] = [
  {
    symbol: "SOL",
    name: "Solana",
    balance: 12.5,
    color: "#9945FF",
    icon: (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
        <span className="text-xs font-bold text-white">S</span>
      </div>
    ),
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: 1500.0,
    color: "#2775CA",
    icon: (
      <div className="w-7 h-7 rounded-full bg-[#2775CA] flex items-center justify-center">
        <span className="text-xs font-bold text-white">$</span>
      </div>
    ),
  },
  {
    symbol: "USDT",
    name: "Tether",
    balance: 250.0,
    color: "#26A17B",
    icon: (
      <div className="w-7 h-7 rounded-full bg-[#26A17B] flex items-center justify-center">
        <span className="text-xs font-bold text-white">₮</span>
      </div>
    ),
  },
];

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0] as const;

const LEVERAGE_PRESETS = [500, 750, 1000] as const;

const TAKE_PROFIT_PRESETS = [100, 300, 500] as const;
const AMOUNT_PRESETS = [5, 10, 20] as const;
const MOCK_CURRENT_PRICE = 198.42;

// Smart number formatting for position summary
const formatValue = (value: number, decimals: number = 2): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 10000) return `${(value / 1000).toFixed(1)}K`;
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
  return value.toFixed(decimals);
};

const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

export function TradingPanel({
  mode,
  isConnected,
  onConnectWallet,
  balance = 0,
  demoBalance,
  currentPrice = MOCK_CURRENT_PRICE,
  activePosition,
  onReversePosition,
  onOpenPosition,
  onResetDemo,
  isDemoMode = true,
}: TradingPanelProps) {
  const [direction, setDirection] = useState<TradeDirection>("long");
  const [amount, setAmount] = useState(10);
  const [leverage, setLeverage] = useState(1000);
  const [takeProfit, setTakeProfit] = useState(500);

  // Spot trading states
  const [payTokenSymbol, setPayTokenSymbol] = useState("SOL");
  const [receiveTokenSymbol, setReceiveTokenSymbol] = useState("USDC");
  const [spotAmount, setSpotAmount] = useState<string>("");
  const [slippage, setSlippage] = useState(0.5);
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [showPayTokenSelect, setShowPayTokenSelect] = useState(false);
  const [showReceiveTokenSelect, setShowReceiveTokenSelect] = useState(false);

  const payToken = TOKENS.find(t => t.symbol === payTokenSymbol) || TOKENS[0];
  const receiveToken = TOKENS.find(t => t.symbol === receiveTokenSymbol) || TOKENS[1];

  const isPerpetuals = mode === "perpetuals";
  // Use demo balance directly (already in USD)
  const balanceInUSD = isDemoMode ? (demoBalance ?? DEMO_CONFIG.INITIAL_BALANCE) : balance * currentPrice;
  const hasInsufficientBalance = amount > balanceInUSD;
  const spotAmountNum = parseFloat(spotAmount) || 0;
  const hasInsufficientSpotBalance = isConnected && spotAmountNum > payToken.balance;
  const isValidTrade = isPerpetuals
    ? amount > 0 && !hasInsufficientBalance
    : spotAmountNum > 0 && !hasInsufficientSpotBalance;

  // Computed values for perpetuals using real fee structure from workbook
  const computedValues = useMemo(() => {
    const notional = amount * leverage;

    // Liquidation at 70% margin lost (from workbook)
    // price_move = LIQUIDATION_THRESHOLD / leverage
    const liqPriceMove = DEMO_CONFIG.LIQUIDATION_THRESHOLD / leverage;

    // Calculate both long and short liquidation prices
    const liqPriceLong = currentPrice * (1 - liqPriceMove);
    const liqPriceShort = currentPrice * (1 + liqPriceMove);

    // Calculate both long and short take profit prices
    const takeProfitLong = currentPrice * (1 + takeProfit / 100 / leverage);
    const takeProfitShort = currentPrice * (1 - takeProfit / 100 / leverage);

    // Potential profit in USD
    const potentialProfit = (takeProfit / 100) * amount;

    // Opening fee: 0.01% of notional (1 BIP)
    const openingFee = DEMO_CONFIG.CLOSE_FEE_MIN * notional;
    const openingFeePercent = DEMO_CONFIG.CLOSE_FEE_MIN * 100;

    // Close fee: max(0.01% notional, 20% profit)
    const minFee = DEMO_CONFIG.CLOSE_FEE_MIN * notional;
    const profitFee = potentialProfit * DEMO_CONFIG.PROFIT_FEE_RATE;
    const estimatedCloseFee = Math.max(minFee, profitFee);

    return {
      notional,
      liqPriceLong,
      liqPriceShort,
      takeProfitLong,
      takeProfitShort,
      potentialProfit,
      openingFee,
      openingFeePercent,
      estimatedCloseFee,
    };
  }, [amount, leverage, currentPrice, takeProfit]);

  // Spot computed values
  const spotValues = useMemo(() => {
    const inputAmount = spotAmountNum;
    if (inputAmount === 0) {
      return { receiveAmount: 0, fee: 0, priceImpact: 0, rate: currentPrice, minReceived: 0 };
    }

    // Calculate based on pay token
    let receiveAmount: number;
    let rate: number;

    if (payTokenSymbol === "SOL") {
      // Selling SOL for stablecoin
      rate = currentPrice;
      receiveAmount = inputAmount * rate;
    } else if (payTokenSymbol === "USDC" || payTokenSymbol === "USDT") {
      // Buying SOL with stablecoin
      rate = currentPrice;
      receiveAmount = inputAmount / rate;
    } else {
      rate = currentPrice;
      receiveAmount = inputAmount;
    }

    const fee = receiveAmount * 0.001; // 0.1% fee
    const priceImpact = inputAmount > 1000 ? 0.05 : inputAmount > 100 ? 0.01 : 0.001; // Simulated price impact
    const minReceived = receiveAmount * (1 - slippage / 100);

    return { receiveAmount, fee, priceImpact, rate, minReceived };
  }, [spotAmountNum, currentPrice, payTokenSymbol, slippage]);

  const handleAmountPreset = (preset: number) => {
    setAmount(preset);
  };

  const handleSwapTokens = () => {
    const temp = payTokenSymbol;
    setPayTokenSymbol(receiveTokenSymbol);
    setReceiveTokenSymbol(temp);
    // Convert the amount when swapping
    if (spotAmountNum > 0) {
      setSpotAmount(spotValues.receiveAmount.toFixed(payTokenSymbol === "SOL" ? 2 : 4));
    }
  };

  const handleMaxSpot = () => {
    setSpotAmount(payToken.balance.toString());
  };

  const handleSelectPayToken = (symbol: string) => {
    if (symbol === receiveTokenSymbol) {
      // Swap if selecting the same as receive
      setReceiveTokenSymbol(payTokenSymbol);
    }
    setPayTokenSymbol(symbol);
    setShowPayTokenSelect(false);
  };

  const handleSelectReceiveToken = (symbol: string) => {
    if (symbol === payTokenSymbol) {
      // Swap if selecting the same as pay
      setPayTokenSymbol(receiveTokenSymbol);
    }
    setReceiveTokenSymbol(symbol);
    setShowReceiveTokenSelect(false);
  };

  const handleTrade = () => {
    if (isPerpetuals && onOpenPosition) {
      onOpenPosition(direction, amount, leverage);
    } else {
      console.log("Spot trade/Order:", {
        direction,
        amount,
        leverage,
        takeProfit,
        mode
      });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
        {/* Perpetuals Interface */}
        {isPerpetuals && (
          <div className="space-y-4">
            {/* Demo Mode banner removed - moved to header */}

            {/* Section: Enter Amount */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Enter Amount</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5">
                    <Wallet className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-sm font-mono font-semibold text-white">{balanceInUSD.toFixed(2)} USDC</span>
                    {isDemoMode && !isConnected && (
                      <span className="text-[10px] font-bold text-amber-400 uppercase">DEMO</span>
                    )}
                  </div>
                  {isConnected && (
                    <button
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                      title="Deposit"
                    >
                      <Plus className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center py-2 lg:py-3 px-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-xl lg:text-3xl font-bold font-mono text-white">${amount}</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 lg:gap-2">
                {AMOUNT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleAmountPreset(preset)}
                    className={`
                      py-2 lg:py-3 rounded-lg lg:rounded-xl text-xs lg:text-sm font-bold transition-all border
                      ${amount === preset
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/70 border-white/10 hover:border-white/30"
                      }
                    `}
                  >
                    ${preset}
                  </button>
                ))}
                <button
                  onClick={() => setAmount(Math.floor(balanceInUSD))}
                  className={`
                    py-2 lg:py-3 rounded-lg lg:rounded-xl text-xs lg:text-sm font-bold transition-all border
                    ${amount === Math.floor(balanceInUSD) && balanceInUSD > 0
                      ? "bg-[var(--color-long)] text-black border-[var(--color-long)]"
                      : "bg-transparent text-[var(--color-long)] border-[var(--color-long)]/30 hover:border-[var(--color-long)]"
                    }
                  `}
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Section: Set Leverage */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Set Leverage</span>
                <span className="text-sm font-mono font-semibold text-white">{leverage}x</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
                {LEVERAGE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setLeverage(preset)}
                    className={`
                      py-2 lg:py-3 rounded-lg lg:rounded-xl text-xs lg:text-sm font-bold transition-all border
                      ${leverage === preset
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/70 border-white/10 hover:border-white/30"
                      }
                    `}
                  >
                    {preset}x
                  </button>
                ))}
              </div>
            </div>

            {/* Section: Set Take Profit */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Set Take Profit</span>
                <span className="text-sm font-mono font-semibold text-white">{takeProfit}%</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
                {TAKE_PROFIT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTakeProfit(preset)}
                    className={`
                      py-2 lg:py-3 rounded-lg lg:rounded-xl text-xs lg:text-sm font-bold transition-all border
                      ${takeProfit === preset
                        ? "bg-[var(--color-long)] text-black border-[var(--color-long)]"
                        : "bg-transparent text-white/70 border-white/10 hover:border-white/30"
                      }
                    `}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Spot Trading Interface */}
        {!isPerpetuals && (
          <div className="space-y-4">
            {/* Slippage Settings Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-wider font-bold text-[var(--text-secondary)]">
                Swap Tokens
              </span>
              <button
                onClick={() => setShowSlippageSettings(!showSlippageSettings)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${showSlippageSettings
                  ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  }`}
              >
                <Settings className="w-3.5 h-3.5" />
                {slippage}%
              </button>
            </div>

            {/* Slippage Settings Panel */}
            {showSlippageSettings && (
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] animate-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-tertiary)]">Slippage Tolerance</span>
                  <div className="flex items-center gap-1">
                    <Info className="w-3 h-3 text-[var(--text-tertiary)]" />
                  </div>
                </div>
                <div className="flex gap-2">
                  {SLIPPAGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSlippage(preset)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${slippage === preset
                        ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-muted)]"
                        : "border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                        }`}
                    >
                      {preset}%
                    </button>
                  ))}
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={slippage}
                      onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                      className="w-full py-2 px-3 rounded-lg text-sm font-medium text-center bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                      step="0.1"
                      min="0.1"
                      max="50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)]">%</span>
                  </div>
                </div>
              </div>
            )}

            {/* You Pay Section */}
            <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="text-sm uppercase tracking-wider font-bold text-[var(--text-secondary)]">
                  You Pay
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    Balance: <span className="font-mono">{payToken.balance.toFixed(payToken.symbol === "SOL" ? 4 : 2)}</span>
                  </span>
                  <button
                    onClick={handleMaxSpot}
                    className="text-xs font-bold text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4">
                <input
                  type="number"
                  value={spotAmount}
                  onChange={(e) => setSpotAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-3xl font-bold text-[var(--text-primary)] focus:outline-none font-mono min-w-0"
                />
                <div className="relative">
                  <button
                    onClick={() => setShowPayTokenSelect(!showPayTokenSelect)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] transition-colors border border-[var(--border-subtle)]"
                  >
                    {payToken.icon}
                    <span className="font-semibold text-[var(--text-primary)]">{payToken.symbol}</span>
                    <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </button>
                  {/* Token Dropdown */}
                  {showPayTokenSelect && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-lg z-50 animate-slide-up overflow-hidden">
                      {TOKENS.map((token) => (
                        <button
                          key={token.symbol}
                          onClick={() => handleSelectPayToken(token.symbol)}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors ${token.symbol === payTokenSymbol ? "bg-[var(--bg-secondary)]" : ""
                            }`}
                        >
                          {token.icon}
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-[var(--text-primary)]">{token.symbol}</div>
                            <div className="text-xs text-[var(--text-tertiary)]">{token.name}</div>
                          </div>
                          <span className="text-xs font-mono text-[var(--text-secondary)]">
                            {token.balance.toFixed(token.symbol === "SOL" ? 4 : 2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {spotAmountNum > 0 && (
                <div className="px-4 pb-3">
                  <span className="text-sm text-[var(--text-tertiary)]">
                    ≈ ${(payToken.symbol === "SOL" ? spotAmountNum * currentPrice : spotAmountNum).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                onClick={handleSwapTokens}
                className="w-10 h-10 rounded-full bg-[var(--bg-card)] border-4 border-[var(--bg-primary)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:rotate-180 transition-all duration-300"
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>

            {/* You Receive Section */}
            <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="text-sm uppercase tracking-wider font-bold text-[var(--text-secondary)]">
                  You Receive
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">
                  Balance: <span className="font-mono">{receiveToken.balance.toFixed(receiveToken.symbol === "SOL" ? 4 : 2)}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 p-4">
                <span className="flex-1 text-3xl font-bold text-[var(--text-primary)] font-mono">
                  {spotAmountNum > 0 ? spotValues.receiveAmount.toFixed(receiveToken.symbol === "SOL" ? 4 : 2) : "0.00"}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowReceiveTokenSelect(!showReceiveTokenSelect)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] transition-colors border border-[var(--border-subtle)]"
                  >
                    {receiveToken.icon}
                    <span className="font-semibold text-[var(--text-primary)]">{receiveToken.symbol}</span>
                    <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </button>
                  {/* Token Dropdown */}
                  {showReceiveTokenSelect && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-lg z-50 animate-slide-up overflow-hidden">
                      {TOKENS.map((token) => (
                        <button
                          key={token.symbol}
                          onClick={() => handleSelectReceiveToken(token.symbol)}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors ${token.symbol === receiveTokenSymbol ? "bg-[var(--bg-secondary)]" : ""
                            }`}
                        >
                          {token.icon}
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-[var(--text-primary)]">{token.symbol}</div>
                            <div className="text-xs text-[var(--text-tertiary)]">{token.name}</div>
                          </div>
                          <span className="text-xs font-mono text-[var(--text-secondary)]">
                            {token.balance.toFixed(token.symbol === "SOL" ? 4 : 2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {spotAmountNum > 0 && (
                <div className="px-4 pb-3">
                  <span className="text-sm text-[var(--text-tertiary)]">
                    ≈ ${(receiveToken.symbol === "SOL" ? spotValues.receiveAmount * currentPrice : spotValues.receiveAmount).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Gamified Insufficient Balance Warning */}
            {hasInsufficientSpotBalance && (
              <div className="relative overflow-hidden rounded-xl bg-[var(--color-short)]/5 border border-[var(--color-short)]/20 animate-slide-up">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-short)]/10 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-[var(--color-short)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--color-short)]">NEED MORE {payToken.symbol}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                      Missing {(spotAmountNum - payToken.balance).toFixed(payToken.symbol === "SOL" ? 4 : 2)} {payToken.symbol} for this swap
                    </p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-[var(--color-short)]/10 hover:bg-[var(--color-short)]/20 text-[var(--color-short)] text-xs font-bold transition-colors flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Get {payToken.symbol}
                  </button>
                </div>
              </div>
            )}

            {/* Swap Details - Enhanced */}
            {spotAmountNum > 0 && (
              <div className="space-y-3 animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wider font-bold text-[var(--text-secondary)]">
                    Swap Details
                  </span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${spotValues.priceImpact > 1 ? "bg-[var(--color-short)]/10" : "bg-[var(--color-long)]/10"
                    }`}>
                    <span className={`text-[10px] font-bold tabular-nums ${spotValues.priceImpact > 1 ? "text-[var(--color-short)]" : "text-[var(--color-long)]"
                      }`}>
                      {spotValues.priceImpact < 0.01 ? "<0.01" : spotValues.priceImpact.toFixed(2)}% impact
                    </span>
                  </div>
                </div>

                {/* Rate Card */}
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ArrowDownUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span className="text-xs uppercase tracking-wider font-bold text-[var(--text-tertiary)]">Exchange Rate</span>
                  </div>
                  <p className="text-lg font-bold font-mono text-[var(--text-primary)] tabular-nums">
                    1 {payToken.symbol} = {payToken.symbol === "SOL" ? `$${currentPrice.toFixed(2)}` : `${(1 / currentPrice).toFixed(4)} SOL`}
                  </p>
                </div>

                {/* Min Received - Highlighted */}
                <div className="p-3 rounded-xl bg-[var(--color-long)]/5 border border-[var(--color-long)]/20">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[var(--color-long)]" />
                      <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-long)]">
                        Min. Received
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      after {slippage}% slippage
                    </span>
                  </div>
                  <p className="text-xl font-bold font-mono text-[var(--color-long)] tabular-nums">
                    {formatValue(spotValues.minReceived, receiveToken.symbol === "SOL" ? 4 : 2)} {receiveToken.symbol}
                  </p>
                </div>

                {/* Fee Row - Compact */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-sm font-medium text-[var(--text-tertiary)]">Network Fee</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-[var(--text-secondary)] tabular-nums">
                    ~0.00025 SOL
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Position Summary */}
        {isPerpetuals && amount > 0 && (
          <div className="space-y-0 pt-3 border-t border-white/10">
            {/* Row: Opening Fee */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm font-medium text-[var(--text-tertiary)]">Opening Fee</span>
              <span className="text-sm font-mono font-semibold text-[var(--text-secondary)]">
                {computedValues.openingFeePercent.toFixed(2)}% (${computedValues.openingFee.toFixed(2)})
              </span>
            </div>

            {/* Row: Est. Entry Price */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm font-medium text-[var(--text-tertiary)]">Est. Entry Price</span>
              <span className="text-sm font-mono font-bold text-white">${currentPrice.toFixed(3)}</span>
            </div>

            {/* Row: Take Profit - shows both long and short prices */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm font-medium text-[var(--text-tertiary)]">Take Profit ({takeProfit}%)</span>
              <span className="text-sm font-mono font-semibold text-white">
                ${computedValues.takeProfitLong.toFixed(3)} / ${computedValues.takeProfitShort.toFixed(3)}
              </span>
            </div>

            {/* Row: Liq Price (long) */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm font-medium text-[var(--text-tertiary)]">
                Liq. Price <span className="text-[var(--color-long)] font-semibold">(long)</span>
              </span>
              <span className="text-sm font-mono font-semibold text-white">${computedValues.liqPriceLong.toFixed(3)}</span>
            </div>

            {/* Row: Liq Price (short) */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm font-medium text-[var(--text-tertiary)]">
                Liq. Price <span className="text-[var(--color-short)] font-semibold">(short)</span>
              </span>
              <span className="text-sm font-mono font-semibold text-white">${computedValues.liqPriceShort.toFixed(3)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Section - Always Visible at Bottom */}
      <div className="flex-shrink-0 p-3 lg:p-4 pb-20 md:pb-6 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]">
        {/* Demo mode allows trading without wallet connection */}
        {isPerpetuals && (isDemoMode || isConnected) ? (
          // Perpetuals trading buttons (demo mode or connected)
          hasInsufficientBalance ? (
            <button
              disabled
              className="w-full py-3 lg:py-4 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Insufficient Funds
            </button>
          ) : !isValidTrade ? (
            <button
              disabled
              className="w-full py-3 lg:py-4 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider cursor-not-allowed"
            >
              Enter Amount
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDirection("long");
                  if (onOpenPosition) onOpenPosition("long", amount, leverage);
                }}
                className="flex-1 py-3 lg:py-4 rounded-lg bg-[var(--color-long)] text-black text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-all"
              >
                Up
              </button>
              <button
                onClick={() => {
                  setDirection("short");
                  if (onOpenPosition) onOpenPosition("short", amount, leverage);
                }}
                className="flex-1 py-3 lg:py-4 rounded-lg bg-[var(--color-short)] text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-all"
              >
                Down
              </button>
            </div>
          )
        ) : !isConnected ? (
          // Not connected and not in demo mode for perps - show connect button
          <button
            onClick={onConnectWallet}
            className="w-full py-3 lg:py-4 rounded-lg bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Connect Wallet
          </button>
        ) : hasInsufficientSpotBalance ? (
          <button
            disabled
            className="w-full py-3 lg:py-4 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Insufficient Funds
          </button>
        ) : !isValidTrade ? (
          <button
            disabled
            className="w-full py-3 lg:py-4 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider cursor-not-allowed"
          >
            Enter Amount
          </button>
        ) : (
          <button
            onClick={handleTrade}
            className="w-full py-3 lg:py-4 rounded-lg bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Swap Now
          </button>
        )}
      </div>
    </div>
  );
}
