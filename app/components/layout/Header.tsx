"use client";

import { Zap, Menu, X, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { WalletSection } from "@/app/components/wallet/WalletSection";
import { WalletModal } from "@/app/components/wallet/WalletModal";
import { UsernameModal } from "@/app/components/wallet/UsernameModal";
import { ProfileModal } from "@/app/components/wallet/ProfileModal";
import { PointsBadge, PointsBadgeCompact } from "@/app/components/rewards/PointsBadge";
import { RewardsModal } from "@/app/components/rewards/RewardsModal";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import { useWalletBalance } from "@/app/hooks/useWalletBalance";
import { useRewards } from "@/app/hooks/useRewards";

export function Header() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const {
    profile,
    showUsernameModal,
    showProfileModal,
    saveUsername,
    updateUsername,
    updateProfile,
    handleDisconnect,
    openProfileModal,
    closeProfileModal,
    closeUsernameModal,
  } = useUserProfile();

  const { balance, balanceUSD } = useWalletBalance();

  const {
    rewardsData,
    tierProgress,
    isRewardsModalOpen,
    openRewardsModal,
    closeRewardsModal,
    copyReferralCode,
  } = useRewards();

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };

    if (isSettingsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingsMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        {/* Racing line accent at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] racing-line opacity-60" />
        
        <div className="flex items-center justify-between h-14 px-6 md:px-8 max-w-[1920px] mx-auto">
          {/* Logo - Miami Synthwave Style */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              {/* Neon glow icon */}
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--warm-yellow)] to-[var(--sunset-orange)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-orange-500/30">
                <Zap className="w-5 h-5 text-[#1a0a2e]" fill="currentColor" strokeWidth={2.5} />
              </div>
              <div className="absolute inset-0 rounded-lg bg-[var(--sunset-orange)] blur-xl opacity-0 group-hover:opacity-40 transition-opacity -z-10" />
            </div>

            <div className="flex flex-col -space-y-0.5">
              <div className="flex items-center">
                <span className="text-2xl font-bold tracking-tight text-[var(--warm-yellow)] lowercase neon-glow-yellow" style={{ fontFamily: 'var(--font-rajdhani), var(--font-space-mono)', textShadow: '0 0 20px rgba(255, 190, 11, 0.5)' }}>up</span>
                <span className="text-2xl font-bold tracking-tight text-[var(--hot-pink)] lowercase neon-glow-pink" style={{ fontFamily: 'var(--font-rajdhani), var(--font-space-mono)', textShadow: '0 0 20px rgba(255, 0, 110, 0.5)' }}>dn</span>
                <span className="text-2xl font-bold tracking-tight text-white lowercase" style={{ fontFamily: 'var(--font-rajdhani), var(--font-space-mono)' }}>.trade</span>
              </div>
              <div className="flex items-center gap-1.5 px-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan-glow)] live-pulse shadow-sm shadow-cyan-400/50" />
                <span className="text-[9px] font-bold text-[var(--cyan-glow)]/80 uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-rajdhani)' }}>Mainnet Live</span>
              </div>
            </div>
          </div>

          {/* Right Section - Settings Menu + Points Badge + Wallet */}
          <div className="relative flex items-center gap-2 sm:gap-3">
            {/* Settings Menu Button */}
            <div className="relative" ref={settingsMenuRef}>
              <button
                onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                aria-label="Settings menu"
              >
                {isSettingsMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {/* Settings Dropdown Menu */}
              {isSettingsMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-lg backdrop-blur-xl overflow-hidden z-50 animate-scale-in">
                  <div className="py-2">
                    <a
                      href="#"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                      onClick={() => setIsSettingsMenuOpen(false)}
                    >
                      Terms
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                      onClick={() => setIsSettingsMenuOpen(false)}
                    >
                      Privacy
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                      onClick={() => setIsSettingsMenuOpen(false)}
                    >
                      Docs
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <div className="h-px bg-[var(--border-subtle)] my-1" />
                    <a
                      href="#"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                      onClick={() => setIsSettingsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Follow us
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Points Badge - Desktop */}
            <div className="hidden sm:block">
              <PointsBadge
                points={rewardsData.totalPoints}
                tier={rewardsData.tier}
                weeklyPoints={rewardsData.weeklyPoints}
                onClick={openRewardsModal}
                isFreshAccount={rewardsData.isFreshAccount}
              />
            </div>
            {/* Points Badge - Mobile (compact) */}
            <div className="sm:hidden">
              <PointsBadgeCompact
                points={rewardsData.totalPoints}
                tier={rewardsData.tier}
                onClick={openRewardsModal}
                isFreshAccount={rewardsData.isFreshAccount}
              />
            </div>
            <WalletSection
              onOpenModal={() => setIsWalletModalOpen(true)}
              onOpenProfile={openProfileModal}
              username={profile?.username}
              avatar={profile?.avatar}
              onUpdateProfile={updateProfile}
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
          avatar={profile.avatar}
          balance={balance}
          balanceUSD={balanceUSD}
          stats={profile.stats}
        />
      )}

      {/* Rewards Modal - "The grind dashboard" */}
      <RewardsModal
        isOpen={isRewardsModalOpen}
        onClose={closeRewardsModal}
        rewardsData={rewardsData}
        tierProgress={tierProgress}
        copyReferralCode={copyReferralCode}
      />
    </>
  );
}
