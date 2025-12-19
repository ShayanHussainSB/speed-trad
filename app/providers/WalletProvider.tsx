"use client";

import { FC, ReactNode, useMemo, useCallback } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Import wallet adapter styles (we'll override with our theme)
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletProviderProps {
  children: ReactNode;
}

// Network configuration (using mainnet by default)
void WalletAdapterNetwork.Mainnet;

// Custom RPC endpoints for better performance
const RPC_ENDPOINTS = {
  mainnet: process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl("mainnet-beta"),
  devnet: clusterApiUrl("devnet"),
  testnet: clusterApiUrl("testnet"),
};

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // Get the RPC endpoint
  const endpoint = useMemo(() => RPC_ENDPOINTS.mainnet, []);

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  // Error handler for wallet errors
  const onError = useCallback((error: WalletError) => {
    console.error("[Wallet Error]", error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider
        wallets={wallets}
        onError={onError}
        autoConnect={true}
      >
        {children}
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProvider;
