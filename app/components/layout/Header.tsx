"use client";

import { Zap } from "lucide-react";
import { useState } from "react";
import { WalletSection } from "@/app/components/wallet/WalletSection";
import { WalletModal } from "@/app/components/wallet/WalletModal";
import { UsernameModal } from "@/app/components/wallet/UsernameModal";
import { ProfileModal } from "@/app/components/wallet/ProfileModal";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import { useWalletBalance } from "@/app/hooks/useWalletBalance";

export function Header() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const {
    profile,
    showUsernameModal,
    showProfileModal,
    saveUsername,
    updateUsername,
    handleDisconnect,
    openProfileModal,
    closeProfileModal,
    closeUsernameModal,
  } = useUserProfile();

  const { balance, balanceUSD } = useWalletBalance();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="flex items-center justify-between h-16 px-4 md:px-6 max-w-[1800px] mx-auto">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center transition-transform group-hover:scale-105">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-[var(--accent-primary)] blur-xl opacity-40 -z-10 group-hover:opacity-60 transition-opacity" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">Speed</span>
                <span className="text-lg font-bold tracking-tight text-[var(--accent-primary)]">Trad</span>
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)] tracking-wide uppercase">
                Built for speed, tuned for 1000x
              </p>
            </div>
          </div>

          {/* Right Section - Wallet */}
          <div className="relative flex items-center gap-3">
            <WalletSection
              onOpenModal={() => setIsWalletModalOpen(true)}
              onOpenProfile={openProfileModal}
              username={profile?.username}
            />
          </div>
        </div>
      </header>

      {/* Wallet Connection Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* Username Setup Modal */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={closeUsernameModal}
        onSave={saveUsername}
        walletAddress={profile?.walletAddress || ""}
      />

      {/* Profile Modal */}
      {profile && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={closeProfileModal}
          onDisconnect={handleDisconnect}
          onUpdateUsername={updateUsername}
          walletAddress={profile.walletAddress}
          username={profile.username}
          balance={balance}
          balanceUSD={balanceUSD}
          stats={profile.stats}
        />
      )}
    </>
  );
}
