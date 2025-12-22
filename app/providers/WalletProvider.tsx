"use client";

import { FC, ReactNode, useMemo, useCallback } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletError } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { getRpcEndpoint, IS_PRODUCTION, NETWORK_DISPLAY_NAME } from "@/app/config/network";

// Import wallet adapter styles (we'll override with our theme)
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // Get the RPC endpoint from network config
  const endpoint = useMemo(() => {
    const rpc = getRpcEndpoint();
    console.log(`[Network] Connected to ${NETWORK_DISPLAY_NAME} - ${IS_PRODUCTION ? "Production" : "Development"}`);
    return rpc;
  }, []);

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
