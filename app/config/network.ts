import { clusterApiUrl } from "@solana/web3.js";

/**
 * Network configuration based on environment variables
 */

// Check if we're in production mode (mainnet)
export const IS_PRODUCTION = process.env.NEXT_PUBLIC_IS_PRODUCTION === "true";

// Network type
export const NETWORK = IS_PRODUCTION ? "mainnet-beta" : "devnet";

// Display name for UI
export const NETWORK_DISPLAY_NAME = IS_PRODUCTION ? "Mainnet" : "Devnet";

// Full display name
export const NETWORK_FULL_NAME = IS_PRODUCTION ? "Solana Mainnet" : "Solana Devnet";

// Get the RPC endpoint
export function getRpcEndpoint(): string {
  const customRpc = process.env.NEXT_PUBLIC_RPC_ENDPOINT;

  // Use custom RPC if provided
  if (customRpc && customRpc.trim() !== "") {
    return customRpc;
  }

  // Otherwise use default Solana RPC for the network
  return clusterApiUrl(NETWORK);
}

// Solscan base URL for transaction links
export const EXPLORER_BASE_URL = IS_PRODUCTION
  ? "https://solscan.io"
  : "https://solscan.io?cluster=devnet";

// Get transaction URL
export function getTransactionUrl(txHash: string): string {
  if (IS_PRODUCTION) {
    return `https://solscan.io/tx/${txHash}`;
  }
  return `https://solscan.io/tx/${txHash}?cluster=devnet`;
}

// Get account URL
export function getAccountUrl(address: string): string {
  if (IS_PRODUCTION) {
    return `https://solscan.io/account/${address}`;
  }
  return `https://solscan.io/account/${address}?cluster=devnet`;
}
