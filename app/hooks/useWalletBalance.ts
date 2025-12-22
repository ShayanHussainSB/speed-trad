"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState, useCallback } from "react";

interface WalletBalanceState {
  balance: number;
  balanceUSD: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Mock SOL price - in production, fetch from Pyth or another oracle
const MOCK_SOL_PRICE = 198.42;

export function useWalletBalance(solPrice: number = MOCK_SOL_PRICE): WalletBalanceState {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const lamports = await connection.getBalance(publicKey);
      const solBalance = lamports / LAMPORTS_PER_SOL;
      setBalance(solBalance);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setError("Failed to fetch balance");
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey, connected]);

  // Fetch balance on connect and set up polling
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();

      // Poll for balance updates every 30 seconds
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    } else {
      setBalance(0);
    }
  }, [connected, publicKey, fetchBalance]);

  // Subscribe to account changes for real-time updates
  useEffect(() => {
    if (!publicKey || !connected) return;

    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo) => {
        const solBalance = accountInfo.lamports / LAMPORTS_PER_SOL;
        setBalance(solBalance);
      },
      "confirmed"
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, publicKey, connected]);

  return {
    balance,
    balanceUSD: balance * solPrice,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}

export default useWalletBalance;
