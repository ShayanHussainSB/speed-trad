"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface UserProfile {
  username: string;
  walletAddress: string;
  isNewUser: boolean;
  stats: {
    totalTrades: number;
    winRate: number;
    totalPnL: number;
    rank: number;
    points: number;
  };
}

const DEFAULT_STATS = {
  totalTrades: 0,
  winRate: 0,
  totalPnL: 0,
  rank: 9999999,
  points: 0,
};

export function useUserProfile() {
  const { publicKey, connected, disconnect } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const walletAddress = publicKey?.toBase58() || "";

  // Load profile from localStorage when wallet connects
  useEffect(() => {
    if (connected && walletAddress) {
      // Use microtask to avoid synchronous setState warning
      queueMicrotask(() => {
        setIsLoading(true);

        // Check if user exists in localStorage
        const storedProfile = localStorage.getItem(`profile_${walletAddress}`);

        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          setProfile({
            ...parsed,
            walletAddress,
            isNewUser: false,
          });
        } else {
          // New user - show username modal
          setProfile({
            username: `user_${walletAddress.slice(0, 8)}`,
            walletAddress,
            isNewUser: true,
            stats: DEFAULT_STATS,
          });
          setShowUsernameModal(true);
        }

        setIsLoading(false);
      });
    } else {
      // Also wrap this in queueMicrotask to avoid synchronous setState
      queueMicrotask(() => {
        setProfile(null);
      });
    }
  }, [connected, walletAddress]);

  // Save username
  const saveUsername = useCallback((username: string) => {
    if (!walletAddress) return;

    const newProfile: UserProfile = {
      username,
      walletAddress,
      isNewUser: false,
      stats: profile?.stats || DEFAULT_STATS,
    };

    localStorage.setItem(`profile_${walletAddress}`, JSON.stringify(newProfile));
    setProfile(newProfile);
    setShowUsernameModal(false);
  }, [walletAddress, profile?.stats]);

  // Update username
  const updateUsername = useCallback((username: string) => {
    if (!walletAddress || !profile) return;

    const updatedProfile = {
      ...profile,
      username,
    };

    localStorage.setItem(`profile_${walletAddress}`, JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  }, [walletAddress, profile]);

  // Disconnect and clear
  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setProfile(null);
    setShowProfileModal(false);
  }, [disconnect]);

  // Open profile modal
  const openProfileModal = useCallback(() => {
    setShowProfileModal(true);
  }, []);

  // Close profile modal
  const closeProfileModal = useCallback(() => {
    setShowProfileModal(false);
  }, []);

  // Close username modal
  const closeUsernameModal = useCallback(() => {
    setShowUsernameModal(false);
  }, []);

  return {
    profile,
    isLoading,
    connected,
    showUsernameModal,
    showProfileModal,
    saveUsername,
    updateUsername,
    handleDisconnect,
    openProfileModal,
    closeProfileModal,
    closeUsernameModal,
  };
}
