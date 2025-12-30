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
import { OrdersList } from "./components/trading/OrdersList";
import { PositionsModal } from "./components/trading/PositionsModal";
import { TradeHistoryModal } from "./components/trading/TradeHistoryModal";
import { ReversePositionModal } from "./components/trading/ReversePositionModal";
import { LeftPanel } from "./components/trading/LeftPanel";
import { PriceTicker } from "./components/trading/PriceTicker";
import { WalletModal } from "./components/wallet/WalletModal";
import { useWalletBalance } from "./hooks/useWalletBalance";
import { useUserProfile } from "./hooks/useUserProfile";
import { usePositions } from "./hooks/usePositions";
import { useMarketTicker } from "./hooks/useMarketTicker";
import { MobileAccountView } from "./components/mobile/MobileAccountView";

type TradingMode = "perpetuals" | "spot";
type MobileTab = "perpetuals" | "spot" | "positions" | "activity" | "account";

type BottomPanelTab = "positions" | "orders" | "history";

export default function TradingPage() {
  const [tradingMode, setTradingMode] = useState<TradingMode>("perpetuals");
  const [mobileTab, setMobileTab] = useState<MobileTab>("perpetuals");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>("positions");
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(true);
  const [isPositionsModalOpen, setIsPositionsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("SOL");

  // Live market data from CoinGecko (volume & market cap)
  const { volume24h, marketCap } = useMarketTicker(`${selectedSymbol}-USD`);

  // Format large numbers (e.g., 2400000000 -> "$2.4B")
  const formatLargeNumber = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(0)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  // Real wallet state from Solana wallet adapter
  const { publicKey, connected } = useWallet();
  const { balance, balanceUSD } = useWalletBalance();
  const { profile } = useUserProfile();

  // Positions state
  const {
    positions,
    orders,
    primaryPosition,
    totalPnL,
    longCount,
    shortCount,
    isReverseModalOpen,
    selectedPosition,
    isProcessing,
    openReverseModal,
    closeReverseModal,
    closePosition,
    reversePosition,
    calculateReverseRequirements,
    openPosition,
    placeOrder,
    cancelOrder,
  } = usePositions();

  const walletAddress = publicKey?.toBase58() || "";

  // Handle reverse confirmation
  const handleReverseConfirm = () => {
    if (selectedPosition) {
      reversePosition(selectedPosition, balanceUSD);
    }
  };

  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === "perpetuals" || tab === "spot") {
      setTradingMode(tab);
    }
  };

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  return (
    <div className="h-screen overflow-hidden relative">
      {/* OutRun/Synthwave Background - Retro Miami Vibe */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Enhanced Horizon Grid */}
        <div className="horizon-grid" />

        {/* Enhanced Sun Disc with More Glow */}
        <div className="sun" />
        
        {/* Floating Neon Particles - Miami Vibes */}
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        
        {/* Palm Tree Silhouettes */}
        <div className="palm-tree palm-tree-left" />
        <div className="palm-tree palm-tree-right" />
        
        {/* Additional gradient overlay for better focus */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
      </div>

      {/* Header */}
      <div className="relative z-50">
        <Header />
      </div>

      {/* Price Ticker - Below Header */}
      <PriceTicker selectedSymbol={selectedSymbol} onSelectCoin={setSelectedSymbol} />

      {/* Main Content */}
      <main className="relative z-10 pt-[104px] pb-10 md:pb-10 h-screen overflow-hidden">
        {/* TRADE View */}
        {(
          <div className="h-[calc(100vh-104px-40px)] md:h-[calc(100vh-104px-40px)] flex flex-col">
            {/* Desktop Layout */}
            <div className="hidden md:flex flex-1 overflow-hidden">
              {/* Far Left Panel - Leaderboard + Quests/Referrals */}
              <div className="w-[280px] flex-shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl">
                <LeftPanel
                  userRank={profile?.stats?.rank || 9999999}
                  userPoints={profile?.stats?.points || 0}
                  walletAddress={walletAddress || "0x2e50ffd0"}
                  userAvatar={profile?.avatar || "pepe"}
                  username={profile?.username}
                />
              </div>

              {/* Center Panel - Chart & Positions */}
              <div className="flex-1 flex flex-col bg-[var(--bg-card)] backdrop-blur-xl">
                {/* Tabs & Stats Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] backdrop-blur-md">
                  <TradingTabs activeMode={tradingMode} onModeChange={setTradingMode} />

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-tertiary)]">24h Volume</span>
                      <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">{formatLargeNumber(volume24h)}</span>
                    </div>
                    <div className="w-px h-4 bg-[var(--border-subtle)]" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-tertiary)]">Market Cap</span>
                      <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">{formatLargeNumber(marketCap)}</span>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="flex-1 min-h-0">
                  <PriceChart
                    symbol={`${selectedSymbol}-USDC`}
                    onSymbolChange={(sym) => setSelectedSymbol(sym.split("/")[0])}
                    activePosition={primaryPosition}
                    onReversePosition={openReverseModal}
                  />
                </div>

                {/* Bottom Panel - Positions & History (Desktop) */}
                <div className={`border-t border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl transition-all duration-300 ${isBottomPanelExpanded ? "h-[280px]" : "h-[48px]"
                  }`}>
                  {/* Panel Header with Tabs */}
                  <div className="flex items-center justify-between px-4 h-[48px] border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] backdrop-blur-md">
                    {/* Tabs */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setBottomPanelTab("positions")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${bottomPanelTab === "positions"
                            ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                          }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Positions
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${bottomPanelTab === "positions"
                            ? "bg-[var(--accent-primary)] text-white"
                            : "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
                          }`}>
                          2
                        </span>
                      </button>
                      <button
                        onClick={() => setBottomPanelTab("orders")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${bottomPanelTab === "orders"
                            ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                          }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Orders
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${bottomPanelTab === "orders"
                            ? "bg-[var(--accent-primary)] text-white"
                            : "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
                          }`}>
                          {orders.filter(o => o.status === "open").length}
                        </span>
                      </button>
                      <button
                        onClick={() => setBottomPanelTab("history")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${bottomPanelTab === "history"
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
                          positions={positions}
                          totalPnL={totalPnL}
                          longCount={longCount}
                          shortCount={shortCount}
                          onViewAll={() => setIsPositionsModalOpen(true)}
                          onClosePosition={closePosition}
                          onReversePosition={openReverseModal}
                          maxVisible={10}
                        />
                      ) : bottomPanelTab === "orders" ? (
                        <OrdersList
                          isConnected={connected}
                          orders={orders}
                          onCancelOrder={cancelOrder}
                          onViewAll={() => { }}
                        />
                      ) : (
                        <TradeHistory isConnected={connected} onViewAll={() => setIsHistoryModalOpen(true)} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Trading */}
              <div className="w-[380px] flex-shrink-0 bg-[var(--bg-card)] border-l border-[var(--border-subtle)] backdrop-blur-xl">
                <TradingPanel
                  mode={tradingMode}
                  isConnected={connected}
                  onConnectWallet={openWalletModal}
                  balance={balance}
                  activePosition={primaryPosition}
                  onReversePosition={openReverseModal}
                  onOpenPosition={(direction, amount, leverage) => openPosition({ direction, size: amount, leverage, symbol: `${selectedSymbol}/USD` })}
                  onPlaceOrder={(direction, amount, trigger, leverage, type) => placeOrder({ direction, size: amount, triggerPrice: trigger, leverage, type, symbol: `${selectedSymbol}/USD` })}
                />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex md:hidden flex-1 flex-col overflow-hidden">
              {/* Trading Views (Perps/Spot) */}
              {(mobileTab === "perpetuals" || mobileTab === "spot") && (
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Chart - Fixed height on mobile to prevent overlap */}
                  <div className="h-[35vh] min-h-[180px] flex-shrink-0">
                    <PriceChart
                      symbol={`${selectedSymbol}-USDC`}
                      onSymbolChange={(sym) => setSelectedSymbol(sym.split("/")[0])}
                      activePosition={primaryPosition}
                      onReversePosition={openReverseModal}
                    />
                  </div>

                  {/* Trading Panel - Takes remaining space, scrollable */}
                  <div className="flex-1 min-h-0 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-y-auto scrollbar-hide pb-16">
                    <TradingPanel
                      mode={mobileTab}
                      isConnected={connected}
                      onConnectWallet={openWalletModal}
                      balance={balance}
                      activePosition={primaryPosition}
                      onReversePosition={openReverseModal}
                    />
                  </div>
                </div>
              )}

              {/* Positions View */}
              {mobileTab === "positions" && (
                <div className="flex-1 overflow-y-auto bg-[var(--bg-card)] pb-16">
                  <PositionsList
                    isConnected={connected}
                    positions={positions}
                    totalPnL={totalPnL}
                    longCount={longCount}
                    shortCount={shortCount}
                    onViewAll={() => setIsPositionsModalOpen(true)}
                    onClosePosition={closePosition}
                    onReversePosition={openReverseModal}
                    maxVisible={10}
                  />
                </div>
              )}

              {/* Activity View (Trades, Orders, etc.) */}
              {mobileTab === "activity" && (
                <div className="flex-1 overflow-y-auto bg-[var(--bg-card)] pb-16">
                  <TradeHistory isConnected={connected} onViewAll={() => setIsHistoryModalOpen(true)} />
                </div>
              )}

              {/* Account View */}
              {mobileTab === "account" && (
                <div className="flex-1 overflow-hidden bg-[var(--bg-primary)] pb-16">
                  <MobileAccountView
                    isConnected={connected}
                    onConnectWallet={openWalletModal}
                    walletAddress={walletAddress}
                    balance={balance}
                    balanceUSD={balanceUSD}
                    username={profile?.username}
                    avatar={profile?.avatar}
                    stats={profile?.stats}
                  />
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
        positions={positions}
        onClosePosition={closePosition}
        onReversePosition={openReverseModal}
      />

      {/* Trade History Modal */}
      <TradeHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Reverse Position Modal */}
      <ReversePositionModal
        isOpen={isReverseModalOpen}
        onClose={closeReverseModal}
        position={selectedPosition}
        availableBalance={balanceUSD}
        onConfirm={handleReverseConfirm}
        onDeposit={openWalletModal}
        isProcessing={isProcessing}
        calculateRequirements={calculateReverseRequirements}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
