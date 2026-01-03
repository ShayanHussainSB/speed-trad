"use client";

import { Zap } from "lucide-react";
import { useState } from "react";
import { WalletSection } from "@/app/components/wallet/WalletSection";
import { WalletModal } from "@/app/components/wallet/WalletModal";
import { UsernameModal } from "@/app/components/wallet/UsernameModal";
import { ProfileModal } from "@/app/components/wallet/ProfileModal";
import { PointsBadge } from "@/app/components/rewards/PointsBadge";
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a12]/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-[1920px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF006E] to-[#8338EC] flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <div className="flex items-baseline">
              <span className="text-lg font-bold tracking-tight text-white">updn</span>
              <span className="text-lg font-bold tracking-tight text-[#FF006E]">.trade</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <PointsBadge
              points={rewardsData.totalPoints}
              onClick={openRewardsModal}
              isFreshAccount={rewardsData.isFreshAccount}
            />
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

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      <UsernameModal
        isOpen={showUsernameModal}
        onClose={closeUsernameModal}
        onSave={saveUsername}
        walletAddress={profile?.walletAddress || ""}
      />

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
