/**
 * Demo Trading Configuration
 * Fee structure and parameters from workbook_v5.ipynb analysis
 */

export const DEMO_CONFIG = {
  // Initial demo balance
  INITIAL_BALANCE: 500,

  // Fee Structure (from workbook analysis)
  OPEN_FEE_RATE: 0, // 0% open fee
  CLOSE_FEE_MIN: 0.0001, // 0.01% = 1 BIP minimum close fee on notional
  PROFIT_FEE_RATE: 0.2, // 20% of profit

  // Liquidation
  LIQUIDATION_THRESHOLD: 0.7, // 70% margin lost triggers liquidation

  // Funding
  FUNDING_RATE_HOURLY: 0.0001, // 0.01% per hour

  // Leverage options
  LEVERAGE_OPTIONS: [500, 750, 1000] as const,
  DEFAULT_LEVERAGE: 1000,

  // Supported assets with their annual volatilities (from workbook)
  ASSETS: {
    BTC: {
      symbol: "BTC",
      name: "Bitcoin",
      annualVol: 0.6, // 60% annual volatility
      color: "#F7931A",
    },
    ETH: {
      symbol: "ETH",
      name: "Ethereum",
      annualVol: 0.75, // 75% annual volatility
      color: "#627EEA",
    },
    SOL: {
      symbol: "SOL",
      name: "Solana",
      annualVol: 1.0, // 100% annual volatility
      color: "#9945FF",
    },
  } as const,

  // Trading constraints
  MIN_MARGIN: 1, // $1 minimum margin
  MAX_MARGIN_PERCENT: 0.95, // Can use up to 95% of balance

  // localStorage key
  STORAGE_KEY: "speed_demo_trading",
} as const;

export type AssetSymbol = keyof typeof DEMO_CONFIG.ASSETS;
export type LeverageOption = (typeof DEMO_CONFIG.LEVERAGE_OPTIONS)[number];

/**
 * Calculate close fee based on workbook formula:
 * Close Fee = max(0.01% notional, 20% profit)
 */
export function calculateCloseFee(notional: number, pnl: number): number {
  const minFee = DEMO_CONFIG.CLOSE_FEE_MIN * notional;
  const profitFee = Math.max(0, pnl) * DEMO_CONFIG.PROFIT_FEE_RATE;
  return Math.max(minFee, profitFee);
}

/**
 * Calculate funding fee based on workbook formula:
 * Funding Fee = notional * hourly_rate * hours_held
 */
export function calculateFundingFee(notional: number, openedAt: string, closedAt: string | Date = new Date()): number {
  const start = new Date(openedAt).getTime();
  const end = closedAt instanceof Date ? closedAt.getTime() : new Date(closedAt).getTime();
  const hoursHeld = (end - start) / (1000 * 60 * 60);
  return notional * DEMO_CONFIG.FUNDING_RATE_HOURLY * hoursHeld;
}

/**
 * Calculate position PnL based on price movement
 */
export function calculatePositionPnL(
  direction: "long" | "short",
  entryPrice: number,
  currentPrice: number,
  notional: number
): number {
  const priceChange = (currentPrice - entryPrice) / entryPrice;
  const directionMultiplier = direction === "long" ? 1 : -1;
  return directionMultiplier * priceChange * notional;
}

/**
 * Check if position should be liquidated (70% margin lost)
 */
export function isPositionLiquidated(
  margin: number,
  pnl: number
): boolean {
  const marginLost = -pnl / margin;
  return marginLost >= DEMO_CONFIG.LIQUIDATION_THRESHOLD;
}

/**
 * Calculate liquidation price for a position
 */
export function calculateLiquidationPrice(
  direction: "long" | "short",
  entryPrice: number,
  leverage: number
): number {
  // At liquidation: margin_lost = 70%
  // margin_lost = leverage * price_move
  // price_move = 0.70 / leverage
  const priceMove = DEMO_CONFIG.LIQUIDATION_THRESHOLD / leverage;

  if (direction === "long") {
    return entryPrice * (1 - priceMove);
  } else {
    return entryPrice * (1 + priceMove);
  }
}

/**
 * Calculate margin remaining percentage
 */
export function calculateMarginHealth(margin: number, pnl: number): number {
  const marginRemaining = margin + pnl;
  return Math.max(0, marginRemaining / margin);
}





