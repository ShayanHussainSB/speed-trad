"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Wallet,
  Target,
  Plus,
  ArrowDownUp,
  ChevronDown,
  Settings,
  Info,
  RefreshCw,
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
  currentPrice = MOCK_CURRENT_PRICE,
  activePosition,
  onReversePosition,
  onOpenPosition,
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

      {/* Trading Form */}
      <div className="flex-1 p-5 space-y-6 overflow-y-auto">
        {/* Perpetuals Interface */}
        {isPerpetuals && (
          <div className="space-y-6">
            {/* Section: Enter Amount */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wide">Enter Amount</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5">
                    <Wallet className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="text-xs font-mono text-white">${balanceInUSD.toFixed(2)}</span>
                  </div>
                  <button 
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                    title="Deposit"
                  >
                    <Plus className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-center py-4 px-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-4xl font-bold font-mono text-white">${amount}</span>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {AMOUNT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleAmountPreset(preset)}
                    className={`
                      py-3 rounded-xl text-sm font-bold transition-all border
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
                    py-3 rounded-xl text-sm font-bold transition-all border
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wide">Set Leverage</span>
                <span className="text-sm font-mono text-white/60">{leverage}x</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {LEVERAGE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setLeverage(preset)}
                    className={`
                      py-3 rounded-xl text-sm font-bold transition-all border
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wide">Set Take Profit</span>
                <span className="text-sm font-mono text-white/60">{takeProfit}%</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {TAKE_PROFIT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTakeProfit(preset)}
                    className={`
                      py-3 rounded-xl text-sm font-bold transition-all border
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

        {/* Position Summary */}
        {isPerpetuals && amount > 0 && (
          <div className="space-y-0 pt-2 border-t border-white/5">
            {/* Row: Entry Price */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-white/50">Entry Price</span>
              <span className="text-sm font-mono text-white">${formatPrice(currentPrice)}</span>
            </div>
            
            {/* Row: Take Profit Price */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-white/50">Take Profit Price</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-white">${formatPrice(computedValues.takeProfitPrice)}</span>
                <span className="text-sm font-mono text-[var(--color-long)]">+${formatValue(computedValues.potentialProfit, 0)}</span>
              </div>
            </div>
            
            {/* Row: Liquidation Price */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-white/50">Liquidation Price</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-white">${formatPrice(computedValues.liquidationPrice)}</span>
                <span className="text-xs text-white/40">{computedValues.liqDistance.toFixed(1)}% away</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Section */}
      <div className="p-4 border-t border-[var(--border-subtle)] space-y-3">
        {/* Direction Toggle - Prominent */}
        {isPerpetuals && isConnected && isValidTrade && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDirection("long")}
              className={`
                py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2
                ${direction === "long"
                  ? "bg-[var(--color-long)] text-black"
                  : "bg-transparent border border-white/10 text-[var(--text-tertiary)] hover:border-[var(--color-long)]/50 hover:text-[var(--color-long)]"
                }
              `}
            >
              <TrendingUp className="w-4 h-4" />
              Up
            </button>
            <button
              onClick={() => setDirection("short")}
              className={`
                py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2
                ${direction === "short"
                  ? "bg-[var(--color-short)] text-white"
                  : "bg-transparent border border-white/10 text-[var(--text-tertiary)] hover:border-[var(--color-short)]/50 hover:text-[var(--color-short)]"
                }
              `}
            >
              <TrendingDown className="w-4 h-4" />
              Down
            </button>
          </div>
        )}


        {/* Main Action Button */}
        {!isConnected ? (
          <button
            onClick={onConnectWallet}
            className="w-full py-4 rounded-lg bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Connect Wallet
          </button>
        ) : (isPerpetuals ? hasInsufficientBalance : hasInsufficientSpotBalance) ? (
          <button
            disabled
            className="w-full py-4 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Insufficient Funds
          </button>
        ) : !isValidTrade ? (
          <button
            disabled
            className="w-full py-4 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider cursor-not-allowed"
          >
            Enter Amount
          </button>
        ) : (
          <button
            onClick={handleTrade}
            className={`
              w-full py-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all
              flex items-center justify-center gap-2
              ${isPerpetuals
                ? direction === "long"
                  ? "bg-[var(--color-long)] text-black hover:opacity-90"
                  : "bg-[var(--color-short)] text-white hover:opacity-90"
                : "bg-white text-black hover:bg-white/90"
              }
            `}
          >
            {isPerpetuals ? (
              direction === "long" ? "Go Up" : "Go Down"
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Swap Now
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
