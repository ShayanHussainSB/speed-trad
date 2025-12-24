/**
 * Smart price formatter that adapts decimal places based on price magnitude.
 * Similar to how TradingView and professional trading platforms display prices.
 */

/**
 * Format price with appropriate decimal places based on magnitude
 * - Prices >= 1000: 2 decimals (e.g., 1234.56)
 * - Prices >= 1: 2-4 decimals (e.g., 123.4567)
 * - Prices >= 0.01: 4-6 decimals (e.g., 0.012345)
 * - Prices < 0.01: up to 8 decimals, showing significant digits
 */
export function formatPrice(price: number, options?: { minDecimals?: number; maxDecimals?: number }): string {
  if (price === 0 || isNaN(price)) return "0.00";

  const absPrice = Math.abs(price);
  let decimals: number;

  if (absPrice >= 10000) {
    decimals = 2;
  } else if (absPrice >= 1000) {
    decimals = 2;
  } else if (absPrice >= 100) {
    decimals = 3;
  } else if (absPrice >= 10) {
    decimals = 4;
  } else if (absPrice >= 1) {
    decimals = 4;
  } else if (absPrice >= 0.1) {
    decimals = 5;
  } else if (absPrice >= 0.01) {
    decimals = 6;
  } else if (absPrice >= 0.001) {
    decimals = 7;
  } else {
    decimals = 8;
  }

  // Apply min/max constraints
  if (options?.minDecimals !== undefined) {
    decimals = Math.max(decimals, options.minDecimals);
  }
  if (options?.maxDecimals !== undefined) {
    decimals = Math.min(decimals, options.maxDecimals);
  }

  return price.toFixed(decimals);
}

/**
 * Format price for compact display (e.g., in charts, labels)
 * Shows fewer decimals but ensures meaningful precision
 */
export function formatPriceCompact(price: number): string {
  if (price === 0 || isNaN(price)) return "0.00";

  const absPrice = Math.abs(price);

  if (absPrice >= 1000) {
    return price.toFixed(2);
  } else if (absPrice >= 1) {
    return price.toFixed(2);
  } else if (absPrice >= 0.01) {
    return price.toFixed(4);
  } else if (absPrice >= 0.0001) {
    return price.toFixed(6);
  } else {
    return price.toFixed(8);
  }
}

/**
 * Format price change percentage
 */
export function formatPriceChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Get the number of decimal places appropriate for a price
 */
export function getPriceDecimals(price: number): number {
  if (price === 0 || isNaN(price)) return 2;

  const absPrice = Math.abs(price);

  if (absPrice >= 1000) return 2;
  if (absPrice >= 100) return 3;
  if (absPrice >= 10) return 4;
  if (absPrice >= 1) return 4;
  if (absPrice >= 0.1) return 5;
  if (absPrice >= 0.01) return 6;
  if (absPrice >= 0.001) return 7;
  return 8;
}

/**
 * Format price for Y-axis labels in charts
 * Ensures consistent width by padding if needed
 */
export function formatPriceForAxis(price: number, referencePrice?: number): string {
  // Use reference price (e.g., current market price) to determine decimals
  // This ensures all axis labels have consistent precision
  const refPrice = referencePrice ?? price;
  const decimals = getPriceDecimals(refPrice);
  return price.toFixed(decimals);
}
