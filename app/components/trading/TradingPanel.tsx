"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Wallet,
  Target,
  Plus,
  Minus,
  ArrowDownUp,
  ChevronDown,
  Settings,
  Info,
  Flame,
  Skull,
  Rocket,
  RefreshCw,
  DollarSign,
  AlertTriangle,
  Trophy,
  BarChart3,
  Percent,
} from "lucide-react";
import { Position } from "@/app/hooks/usePositions";

type TradeDirection = "long" | "short";
type TradingMode = "perpetuals" | "spot";

interface TradingPanelProps {
  mode: TradingMode;
  isConnected: boolean;
  onConnectWallet: () => void;
  balance?: number;
  currentPrice?: number;
  activePosition?: Position | null;
  onReversePosition?: (position: Position) => void;
  onOpenPosition?: (direction: TradeDirection, amount: number, leverage: number) => void;
  onPlaceOrder?: (direction: TradeDirection, amount: number, triggerPrice: number, leverage: number, type: "limit" | "stop") => void;
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

// Risk level based on leverage
const getRiskLevel = (leverage: number): { level: string; color: string; flames: number; message: string } => {
  if (leverage >= 1000) {
    return {
      level: "DEGEN MODE",
      color: "var(--color-short)",
      flames: 3,
      message: "Maximum risk. One wrong move = rekt"
    };
  }
  if (leverage >= 750) {
    return {
      level: "HIGH RISK",
      color: "#FF6B00",
      flames: 2,
      message: "Playing with fire. Stay sharp"
    };
  }
  return {
    level: "ELEVATED",
    color: "#FFD700",
    flames: 1,
    message: "High leverage active. Watch your liq price"
  };
};
const TAKE_PROFIT_PRESETS = [100, 300, 500] as const;
const AMOUNT_PRESETS = [5, 10, 15, 20] as const;
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
  currentPrice = MOCK_CURRENT_PRICE,
  activePosition,
  onReversePosition,
  onOpenPosition,
  onPlaceOrder,
}: TradingPanelProps) {
  const [direction, setDirection] = useState<TradeDirection>("long");
  const [amount, setAmount] = useState(500);
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
  const balanceInUSD = balance * currentPrice;
  const hasInsufficientBalance = isConnected && amount > balanceInUSD;
  const spotAmountNum = parseFloat(spotAmount) || 0;
  const hasInsufficientSpotBalance = isConnected && spotAmountNum > payToken.balance;
  const isValidTrade = isPerpetuals
    ? amount > 0 && !hasInsufficientBalance
    : spotAmountNum > 0 && !hasInsufficientSpotBalance;

  // Computed values for perpetuals
  const computedValues = useMemo(() => {
    const collateralSOL = amount / currentPrice;
    const positionSize = collateralSOL * leverage;
    const positionValue = positionSize * currentPrice;
    const fee = positionValue * 0.0005;

    const liquidationPrice = direction === "long"
      ? currentPrice * (1 - 0.9 / leverage)
      : currentPrice * (1 + 0.9 / leverage);

    const takeProfitPrice = direction === "long"
      ? currentPrice * (1 + takeProfit / 100 / leverage)
      : currentPrice * (1 - takeProfit / 100 / leverage);

    // Distance to liquidation as percentage
    const liqDistance = Math.abs((liquidationPrice - currentPrice) / currentPrice * 100);

    // Potential profit in USD
    const potentialProfit = (takeProfit / 100) * amount;

    // Risk/Reward ratio (simplified: potential profit vs potential loss at liquidation)
    const potentialLoss = amount * 0.9; // ~90% loss at liquidation
    const riskRewardRatio = potentialProfit / potentialLoss;

    return {
      collateralSOL,
      positionSize,
      positionValue,
      fee,
      liquidationPrice,
      takeProfitPrice,
      liqDistance,
      potentialProfit,
      riskRewardRatio,
    };
  }, [amount, leverage, currentPrice, direction, takeProfit]);

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

  const handleAmountChange = (delta: number) => {
    const newAmount = Math.max(0, amount + delta);
    setAmount(newAmount);
  };

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
    if (!isConnected) {
      onConnectWallet();
      return;
    }

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
    <div className="flex flex-col h-full">
      {/* Top Section - Balance & Header - Miami Terminal Style */}
      <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-secondary)]/50 to-[var(--bg-tertiary)]/30 backdrop-blur-md relative">
        {/* Subtle racing line accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--sunset-orange)]/30 to-transparent" />
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.25em] mb-0.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>Terminal</span>
            <span className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              {isPerpetuals ? "Perpetuals" : "Spot Swap"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-[var(--sunset-orange)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-rajdhani)' }}>Available</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold font-mono text-white tabular-nums">${balanceInUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <button className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--sunset-orange)]/10 to-[var(--hot-pink)]/5 border border-[var(--sunset-orange)]/20 flex items-center justify-center hover:border-[var(--sunset-orange)]/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all group">
              <Plus className="w-4 h-4 text-[var(--sunset-orange)] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Direction Toggle - Minimalist Version */}
      {isPerpetuals && (
        <div className="p-1 px-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/10">
          <div className="flex h-12">
            <button
              onClick={() => setDirection("long")}
              className={`
                flex-1 flex items-center justify-center gap-2 font-black transition-all duration-300 relative
                ${direction === "long" ? "text-[var(--color-long)]" : "text-[var(--text-tertiary)] hover:text-white"}
              `}
            >
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-long)] transition-all duration-300 shadow-[0_0_10px_var(--color-long)] ${direction === "long" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`} />
              <TrendingUp className={`w-4 h-4 transition-transform duration-500 ${direction === "long" ? "rotate-0 scale-110" : "-rotate-12 scale-90"}`} />
              <span className="text-xs uppercase tracking-[0.2em]">Long</span>
            </button>
            <div className="w-[1px] h-4 my-auto bg-[var(--border-subtle)]" />
            <button
              onClick={() => setDirection("short")}
              className={`
                flex-1 flex items-center justify-center gap-2 font-black transition-all duration-300 relative
                ${direction === "short" ? "text-[var(--color-short)]" : "text-[var(--text-tertiary)] hover:text-white"}
              `}
            >
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-short)] transition-all duration-300 shadow-[0_0_10px_var(--color-short)] ${direction === "short" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`} />
              <TrendingDown className={`w-4 h-4 transition-transform duration-500 ${direction === "short" ? "rotate-0 scale-110" : "rotate-12 scale-90"}`} />
              <span className="text-xs uppercase tracking-[0.2em]">Short</span>
            </button>
          </div>
        </div>
      )}

      {/* Trading Form */}
      <div className="flex-1 p-3 md:p-4 space-y-4 md:space-y-5 overflow-y-auto">
        {/* Perpetuals Amount Input */}
        {isPerpetuals && (
          <div className="space-y-4">
            {/* Technical Amount Input */}
            <div className="relative group">
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/5 group-focus-within:bg-[var(--accent-primary)] transition-colors" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Amount (USD)</span>
                <span className="text-[11px] font-black text-white/60 font-mono">≈ {(amount / currentPrice).toFixed(4)} SOL</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-baseline gap-2">
                  <span className="text-xl font-black text-[var(--accent-primary)]">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-4xl font-black text-white focus:outline-none font-mono tracking-tighter"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                  <button
                    onClick={() => handleAmountChange(-100)}
                    className="w-8 h-8 rounded-md hover:bg-white/5 flex items-center justify-center text-[var(--text-tertiary)] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAmountChange(100)}
                    className="w-8 h-8 rounded-md hover:bg-white/5 flex items-center justify-center text-[var(--text-tertiary)] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sharp Presets */}
            <div className="grid grid-cols-5 gap-1.5">
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleAmountPreset(preset)}
                  className={`
                    py-2 rounded-md text-[10px] font-black transition-all border
                    ${amount === preset
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-[var(--text-tertiary)] border-white/5 hover:border-white/20 hover:text-white"
                    }
                  `}
                >
                  ${preset}
                </button>
              ))}
              <button
                onClick={() => setAmount(Math.floor(balanceInUSD))}
                className={`
                  py-2 rounded-md text-[10px] font-black transition-all border
                  ${amount === Math.floor(balanceInUSD) && balanceInUSD > 0
                    ? "bg-[var(--color-long)] text-black border-[var(--color-long)]"
                    : "bg-transparent text-[var(--color-long)] border-[var(--color-long)]/20 hover:bg-[var(--color-long)]/5"
                  }
                `}
              >
                MAX
              </button>
            </div>

            {/* Gamified Insufficient Balance Warning */}
            {hasInsufficientBalance && (
              <div className="relative overflow-hidden rounded-xl bg-[var(--color-short)]/5 border border-[var(--color-short)]/20 animate-slide-up">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-short)]/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[var(--color-short)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--color-short)]">WALLET&apos;S FEELING LIGHT</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                      Need ${(amount - balanceInUSD).toFixed(0)} more to enter this position
                    </p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-[var(--color-short)]/10 hover:bg-[var(--color-short)]/20 text-[var(--color-short)] text-xs font-bold transition-colors flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Top Up
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Spot Trading Interface */}
        {!isPerpetuals && (
          <div className="space-y-4">
            {/* Slippage Settings Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
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
                <span className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
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
                <span className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
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
                  <span className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                    SWAP DETAILS
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
                    <span className="text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">Exchange Rate</span>
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
                      <span className="text-[10px] uppercase tracking-wide font-bold text-[var(--color-long)]">
                        Min. Received
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-tertiary)]">
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
                    <Zap className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                    <span className="text-xs text-[var(--text-tertiary)]">Network Fee</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-[var(--text-secondary)] tabular-nums">
                    ~0.00025 SOL
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leverage Management - Technical Strip */}
        {isPerpetuals && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">Leverage_Protocol</span>
              <span className="text-[12px] font-black font-mono text-white tracking-widest">{leverage}X_MULT</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[10, 50, 100, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setLeverage(preset)}
                  className={`
                    py-2 rounded-md text-[10px] font-black transition-all border
                    ${leverage === preset
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-[var(--text-tertiary)] border-white/5 hover:border-white/20 hover:text-white"
                    }
                  `}
                >
                  {preset}X
                </button>
              ))}
            </div>

            {/* Risk Protocol - Sharp Mode */}
            {leverage >= 500 && (() => {
              const risk = getRiskLevel(leverage);
              return (
                <div className="p-3 bg-white/[0.02] border border-white/10 rounded overflow-hidden">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full animate-ping`} style={{ backgroundColor: risk.color }} />
                        <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: risk.color }}>
                          {risk.level}
                        </span>
                      </div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">
                        {risk.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Profit_Extract Protocol */}
        {isPerpetuals && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">Exit_Threshold</span>
              <span className="text-[12px] font-black font-mono text-white tracking-widest">+{takeProfit}%_ROI</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {TAKE_PROFIT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTakeProfit(preset)}
                  className={`
                    py-2 rounded-md text-[10px] font-black transition-all border
                    ${takeProfit === preset
                      ? "bg-[var(--color-long)] text-black border-[var(--color-long)]"
                      : "bg-transparent text-[var(--text-tertiary)] border-white/5 hover:border-white/20 hover:text-white"
                    }
                  `}
                >
                  {preset}%_TP
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Position Summary - Perpetuals */}
        {isPerpetuals && amount > 0 && (
          <div className="space-y-2 md:space-y-3 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                POSITION SUMMARY
              </span>
              <div className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg bg-[var(--bg-secondary)]">
                <BarChart3 className="w-2.5 h-2.5 md:w-3 md:h-3 text-[var(--accent-primary)]" />
                <span className="text-[9px] md:text-[10px] font-bold text-[var(--text-tertiary)]">
                  R:R {computedValues.riskRewardRatio.toFixed(1)}x
                </span>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-1.5 md:gap-2">
              {/* Position Size */}
              <div className="p-2 md:p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-1 md:gap-1.5 mb-0.5 md:mb-1">
                  <BarChart3 className="w-3 h-3 md:w-3.5 md:h-3.5 text-[var(--accent-primary)]" />
                  <span className="text-[10px] md:text-[11px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">Size</span>
                </div>
                <p className="text-base md:text-lg font-bold font-mono text-[var(--text-primary)] tabular-nums">
                  {formatValue(computedValues.positionSize)} SOL
                </p>
                <p className="text-[9px] md:text-[10px] text-[var(--text-tertiary)] font-mono tabular-nums">
                  ${formatValue(computedValues.positionValue, 0)}
                </p>
              </div>

              {/* Entry Price */}
              <div className="p-2 md:p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-1 md:gap-1.5 mb-0.5 md:mb-1">
                  <DollarSign className="w-3 h-3 md:w-3.5 md:h-3.5 text-[var(--text-tertiary)]" />
                  <span className="text-[10px] md:text-[11px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">Entry</span>
                </div>
                <p className="text-base md:text-lg font-bold font-mono text-[var(--text-primary)] tabular-nums">
                  ${formatPrice(currentPrice)}
                </p>
                <p className="text-[9px] md:text-[10px] text-[var(--text-tertiary)]">Market Price</p>
              </div>
            </div>

            {/* Liquidation - Full Width with Visual Indicator */}
            <div className="p-2 md:p-3 rounded-xl bg-[var(--color-short)]/5 border border-[var(--color-short)]/20">
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <div className="flex items-center gap-1 md:gap-1.5">
                  <AlertTriangle className="w-3 h-3 md:w-3.5 md:h-3.5 text-[var(--color-short)]" />
                  <span className="text-[10px] md:text-[11px] uppercase tracking-wide font-bold text-[var(--color-short)]">
                    Liquidation
                  </span>
                </div>
                <div className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full bg-[var(--color-short)]/10">
                  <span className="text-[9px] md:text-[10px] font-bold text-[var(--color-short)] tabular-nums">
                    {computedValues.liqDistance.toFixed(1)}% away
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg md:text-xl font-bold font-mono text-[var(--color-short)] tabular-nums">
                  ${formatPrice(computedValues.liquidationPrice)}
                </p>
                <p className="text-[9px] md:text-[10px] text-[var(--text-tertiary)]">
                  {direction === "long" ? "↓ drops" : "↑ rises"}
                </p>
              </div>
              {/* Visual distance bar */}
              <div className="mt-1.5 md:mt-2 h-1 md:h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-short)] to-[var(--color-short)]/50 transition-all duration-300"
                  style={{ width: `${Math.min(computedValues.liqDistance * 10, 100)}%` }}
                />
              </div>
            </div>

            {/* Take Profit - Full Width with Potential Gain */}
            <div className="p-2 md:p-3 rounded-xl bg-[var(--color-long)]/5 border border-[var(--color-long)]/20">
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <div className="flex items-center gap-1 md:gap-1.5">
                  <Target className="w-3 h-3 md:w-3.5 md:h-3.5 text-[var(--color-long)]" />
                  <span className="text-[10px] md:text-[11px] uppercase tracking-wide font-bold text-[var(--color-long)]">
                    Take Profit
                  </span>
                </div>
                <div className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full bg-[var(--color-long)]/10">
                  <Trophy className="w-2.5 h-2.5 md:w-3 md:h-3 text-[var(--color-long)]" />
                  <span className="text-[9px] md:text-[10px] font-bold text-[var(--color-long)] tabular-nums">
                    +{takeProfit}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg md:text-xl font-bold font-mono text-[var(--color-long)] tabular-nums">
                  ${formatPrice(computedValues.takeProfitPrice)}
                </p>
                <div className="text-right">
                  <p className="text-[11px] md:text-xs font-bold text-[var(--color-long)] tabular-nums">
                    +${formatValue(computedValues.potentialProfit, 0)}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-[var(--text-tertiary)]">profit</p>
                </div>
              </div>
            </div>

            {/* Fee - Compact */}
            <div className="flex items-center justify-between p-2 md:p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1 md:gap-1.5">
                <Percent className="w-3 h-3 md:w-3.5 md:h-3.5 text-[var(--text-tertiary)]" />
                <span className="text-[11px] md:text-xs text-[var(--text-tertiary)]">Fee (0.05%)</span>
              </div>
              <span className="text-xs md:text-sm font-bold font-mono text-[var(--text-secondary)] tabular-nums">
                ~${formatValue(computedValues.fee)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Miami Racing Execution */}
      <div className="p-4 border-t border-[var(--border-subtle)] space-y-3 bg-gradient-to-t from-[var(--bg-elevated)]/50 to-transparent">
        {isConnected && isPerpetuals && activePosition && onReversePosition && (
          <button
            onClick={() => onReversePosition(activePosition)}
            className={`
              w-full py-3.5 rounded-lg text-xs font-bold transition-all border uppercase tracking-wider
              flex items-center justify-center gap-2 miami-hover
              ${activePosition.direction === "long"
                ? "bg-[var(--color-short)]/10 border-[var(--color-short)]/30 text-[var(--color-short)] hover:bg-[var(--color-short)]/20 hover:shadow-lg hover:shadow-pink-500/20"
                : "bg-[var(--color-long)]/10 border-[var(--color-long)]/30 text-[var(--color-long)] hover:bg-[var(--color-long)]/20 hover:shadow-lg hover:shadow-yellow-500/20"
              }
            `}
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            <RefreshCw className="w-4 h-4" />
            Reverse to {activePosition.direction === "long" ? "Short" : "Long"}
          </button>
        )}

        {!isConnected ? (
          <button
            onClick={onConnectWallet}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-[var(--warm-yellow)] via-[var(--sunset-orange)] to-[var(--hot-pink)] text-[#1a0a2e] text-sm font-bold uppercase tracking-wider hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 relative overflow-hidden"
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
            <Zap className="w-5 h-5" fill="currentColor" />
            Connect Wallet
          </button>
        ) : (isPerpetuals ? hasInsufficientBalance : hasInsufficientSpotBalance) ? (
          <button
            disabled
            className="w-full py-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-3"
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            <Wallet className="w-4 h-4" />
            Insufficient Funds
          </button>
        ) : !isValidTrade ? (
          <button
            disabled
            className="w-full py-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-3"
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            Enter Amount
          </button>
        ) : (
          <button
            onClick={handleTrade}
            className={`
              w-full py-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all
              flex items-center justify-center gap-3 relative overflow-hidden group
              ${isPerpetuals
                ? direction === "long"
                  ? "bg-gradient-to-r from-[var(--warm-yellow)] to-[var(--color-long-dim)] text-[#1a0a2e] hover:shadow-xl hover:shadow-yellow-500/30"
                  : "bg-gradient-to-r from-[var(--hot-pink)] to-[var(--color-short-dim)] text-white hover:shadow-xl hover:shadow-pink-500/30"
                : "bg-gradient-to-r from-[var(--warm-yellow)] to-[var(--sunset-orange)] text-[#1a0a2e] hover:shadow-xl hover:shadow-orange-500/30"
              }
              hover:scale-[1.02]
            `}
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            {/* Racing stripe animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            {isPerpetuals ? (
              <>
                <Rocket className={`w-5 h-5 ${direction === "long" ? "" : ""}`} />
                {direction === "long" ? "Open Long" : "Open Short"}
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" fill="currentColor" />
                Swap Now
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
