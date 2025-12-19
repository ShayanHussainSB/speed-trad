"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChevronUp, ChevronDown, BarChart3, Clock } from "lucide-react";
import { Header } from "./components/layout/Header";
import { MobileNav } from "./components/layout/MobileNav";
import { Footer } from "./components/layout/Footer";
import { TradingTabs } from "./components/trading/TradingTabs";
import { PriceChart } from "./components/trading/PriceChart";
import { TradingPanel } from "./components/trading/TradingPanel";
import { PositionsList } from "./components/trading/PositionsList";
import { TradeHistory } from "./components/trading/TradeHistory";
import { PositionsModal } from "./components/trading/PositionsModal";
import { TradeHistoryModal } from "./components/trading/TradeHistoryModal";
import { Leaderboard } from "./components/trading/Leaderboard";
import { PriceTicker } from "./components/trading/PriceTicker";
import { WalletModal } from "./components/wallet/WalletModal";
import { useWalletBalance } from "./hooks/useWalletBalance";

type TradingMode = "perpetuals" | "spot";
type MobileTab = "perpetuals" | "spot" | "history" | "account";

type BottomPanelTab = "positions" | "history";

export default function TradingPage() {
  const [tradingMode, setTradingMode] = useState<TradingMode>("perpetuals");
  const [mobileTab, setMobileTab] = useState<MobileTab>("perpetuals");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>("positions");
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(true);
  const [isPositionsModalOpen, setIsPositionsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Real wallet state from Solana wallet adapter
  const { publicKey, connected } = useWallet();
  const { balance, balanceUSD } = useWalletBalance();

  const walletAddress = publicKey?.toBase58() || "";

  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === "perpetuals" || tab === "spot") {
      setTradingMode(tab);
    }
  };

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  return (
    <div className="h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Background Effects - Euphoria-inspired */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Main spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-spotlight-intense opacity-40" />

        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--accent-primary) 1px, transparent 1px), linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial-pink opacity-20" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial-pink opacity-10" />
      </div>

      {/* Header */}
      <Header />

      {/* Price Ticker - Below Header */}
      <PriceTicker selectedSymbol="SOL" />

      {/* Main Content */}
      <main className="pt-[104px] pb-10 h-screen overflow-hidden">
        {/* TRADE View */}
        {(
          <div className="h-[calc(100vh-104px-40px)] md:h-[calc(100vh-104px-40px)] flex flex-col">
            {/* Desktop Layout */}
            <div className="hidden md:flex flex-1 overflow-hidden">
              {/* Far Left Panel - Top Traders Leaderboard */}
              <div className="w-[280px] flex-shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <Leaderboard
                  userRank={9999999}
                  userPoints={0}
                  walletAddress={walletAddress || "0x2e50ffd0"}
                />
              </div>

              {/* Center Panel - Chart & Positions */}
              <div className="flex-1 flex flex-col">
                {/* Tabs & Stats Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
                  <TradingTabs activeMode={tradingMode} onModeChange={setTradingMode} />

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-tertiary)]">24h Volume</span>
                      <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">$2.4B</span>
                    </div>
                    <div className="w-px h-4 bg-[var(--border-subtle)]" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-tertiary)]">Open Interest</span>
                      <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">$890M</span>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="flex-1 min-h-0">
                  <PriceChart symbol="SOL-USDC" />
                </div>

                {/* Bottom Panel - Positions & History (Desktop) */}
                <div className={`border-t border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all duration-300 ${
                  isBottomPanelExpanded ? "h-[280px]" : "h-[48px]"
                }`}>
                  {/* Panel Header with Tabs */}
                  <div className="flex items-center justify-between px-4 h-[48px] border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                    {/* Tabs */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setBottomPanelTab("positions")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          bottomPanelTab === "positions"
                            ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Positions
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          bottomPanelTab === "positions"
                            ? "bg-[var(--accent-primary)] text-white"
                            : "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
                        }`}>
                          2
                        </span>
                      </button>
                      <button
                        onClick={() => setBottomPanelTab("history")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          bottomPanelTab === "history"
                            ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        History
                      </button>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setIsBottomPanelExpanded(!isBottomPanelExpanded)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <span className="text-[10px] font-medium">
                        {isBottomPanelExpanded ? "Collapse" : "Expand"}
                      </span>
                      {isBottomPanelExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Panel Content */}
                  {isBottomPanelExpanded && (
                    <div className="h-[calc(100%-48px)] overflow-hidden">
                      {bottomPanelTab === "positions" ? (
                        <PositionsList
                          isConnected={connected}
                          onViewAll={() => setIsPositionsModalOpen(true)}
                          maxVisible={2}
                        />
                      ) : (
                        <TradeHistory isConnected={connected} onViewAll={() => setIsHistoryModalOpen(true)} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Trading */}
              <div className="w-[380px] flex-shrink-0 bg-[var(--bg-card)] border-l border-[var(--border-subtle)]">
                <TradingPanel
                  mode={tradingMode}
                  isConnected={connected}
                  onConnectWallet={openWalletModal}
                  balance={balance}
                />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex md:hidden flex-1 flex-col overflow-hidden">
              {/* Trading Views */}
              {(mobileTab === "perpetuals" || mobileTab === "spot") && (
                <>
                  {/* Chart */}
                  <div className="flex-1 min-h-0">
                    <PriceChart symbol="SOL-USDC" />
                  </div>

                  {/* Trading Panel */}
                  <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-card)] max-h-[50vh] overflow-y-auto scrollbar-hide">
                    <TradingPanel
                      mode={mobileTab}
                      isConnected={connected}
                      onConnectWallet={openWalletModal}
                      balance={balance}
                    />
                  </div>
                </>
              )}

              {/* History View */}
              {mobileTab === "history" && (
                <div className="flex-1 overflow-hidden bg-[var(--bg-card)]">
                  <TradeHistory isConnected={connected} onViewAll={() => setIsHistoryModalOpen(true)} />
                </div>
              )}

              {/* Account View */}
              {mobileTab === "account" && (
                <div className="flex-1 overflow-y-auto bg-[var(--bg-card)]">
                  {!connected ? (
                    <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center mb-6 animate-glow-breathe">
                        <svg className="w-10 h-10 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Connect Your Wallet</h2>
                      <p className="text-sm text-[var(--text-tertiary)] mb-6 max-w-xs">
                        Connect your Solana wallet to start trading with up to 1000x leverage
                      </p>
                      <button onClick={openWalletModal} className="btn btn-primary py-3 px-8">
                        Connect Wallet
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {/* Wallet Card */}
                      <div className="card-glow p-5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-[var(--text-tertiary)]">Connected Wallet</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--color-long)] animate-pulse" />
                            <span className="text-xs text-[var(--color-long)]">Active</span>
                          </div>
                        </div>
                        <p className="font-mono text-[var(--text-primary)] text-sm truncate">{walletAddress}</p>
                      </div>

                      {/* Balance Card */}
                      <div className="card p-5">
                        <p className="text-sm text-[var(--text-tertiary)] mb-2">Trading Balance</p>
                        <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">{balance.toFixed(4)} SOL</p>
                        <p className="text-sm text-[var(--text-secondary)]">≈ ${balanceUSD.toFixed(2)}</p>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="card p-4">
                          <p className="text-xs text-[var(--text-tertiary)] mb-1">Open Positions</p>
                          <p className="text-xl font-bold text-[var(--text-primary)]">0</p>
                        </div>
                        <div className="card p-4">
                          <p className="text-xs text-[var(--text-tertiary)] mb-1">Total PnL</p>
                          <p className="text-xl font-bold text-[var(--text-secondary)]">$0.00</p>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <MobileNav activeTab={mobileTab} onTabChange={handleMobileTabChange} />

      {/* Wallet Modal */}
      <WalletModal isOpen={isWalletModalOpen} onClose={closeWalletModal} />

      {/* Positions Modal */}
      <PositionsModal
        isOpen={isPositionsModalOpen}
        onClose={() => setIsPositionsModalOpen(false)}
      />

      {/* Trade History Modal */}
      <TradeHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
