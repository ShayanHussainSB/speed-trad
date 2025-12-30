"use client";

import { Zap } from "lucide-react";
import { useState } from "react";
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
                <span className="text-2xl font-bold tracking-tight text-[var(--warm-yellow)] uppercase neon-glow-yellow" style={{ fontFamily: 'var(--font-rajdhani), var(--font-space-mono)', textShadow: '0 0 20px rgba(255, 190, 11, 0.5)' }}>up</span>
                <span className="text-2xl font-bold tracking-tight text-[var(--hot-pink)] uppercase neon-glow-pink" style={{ fontFamily: 'var(--font-rajdhani), var(--font-space-mono)', textShadow: '0 0 20px rgba(255, 0, 110, 0.5)' }}>dn</span>
                <span className="text-2xl font-bold tracking-tight text-white uppercase" style={{ fontFamily: 'var(--font-rajdhani), var(--font-space-mono)' }}>.trade</span>
              </div>
              <div className="flex items-center gap-1.5 px-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan-glow)] live-pulse shadow-sm shadow-cyan-400/50" />
                <span className="text-[9px] font-bold text-[var(--cyan-glow)]/80 uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-rajdhani)' }}>Mainnet Live</span>
              </div>
            </div>
          </div>

          {/* Right Section - Points Badge + Wallet */}
          <div className="relative flex items-center gap-2 sm:gap-3">
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
