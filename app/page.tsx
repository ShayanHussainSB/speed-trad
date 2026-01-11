"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Layout, FlaskConical, ChevronDown, RotateCcw } from "lucide-react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { MobileNav } from "./components/layout/MobileNav";
import { PriceChart } from "./components/trading/PriceChart";
import { TradingPanel } from "./components/trading/TradingPanel";
import { PositionsList } from "./components/trading/PositionsList";
import { TradeHistory, Trade } from "./components/trading/TradeHistory";
import { TradingTabs } from "./components/trading/TradingTabs";
import { PositionsModal } from "./components/trading/PositionsModal";
import { TradeHistoryModal } from "./components/trading/TradeHistoryModal";
import { ReversePositionModal } from "./components/trading/ReversePositionModal";
import { LeftPanel } from "./components/trading/LeftPanel";
import { PriceTicker } from "./components/trading/PriceTicker";
import { WalletModal } from "./components/wallet/WalletModal";
import { NotificationContainer } from "./components/notifications/NotificationContainer";
import { useWalletBalance } from "./hooks/useWalletBalance";
import { useUserProfile } from "./hooks/useUserProfile";
import { usePositions } from "./hooks/usePositions";
import { useLivePrice } from "./hooks/useLivePrice";
import { useMarketTicker } from "./hooks/useMarketTicker";
import { useNotifications } from "./contexts/NotificationContext";

type TradingMode = "perpetuals" | "spot";
type MobileTab = "perpetuals" | "spot" | "positions" | "activity" | "account";
type BottomPanelTab = "positions" | "history";

export default function TradingPage() {
  const [tradingMode, setTradingMode] = useState<TradingMode>("perpetuals");
  const [mobileTab, setMobileTab] = useState<MobileTab>("perpetuals");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>("positions");
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(true);
  const [isPositionsModalOpen, setIsPositionsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("SOL");
  const [isLeftPanelHidden, setIsLeftPanelHidden] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  // Live market data
  const { volume24h, marketCap } = useMarketTicker(`${selectedSymbol}-USD`);
  const livePriceData = useLivePrice(`${selectedSymbol}-USD`);
  const currentPrice = livePriceData.price;

  // Wallet
  const { publicKey, connected } = useWallet();
  const { balance, balanceUSD } = useWalletBalance();
  const { profile } = useUserProfile();
  const walletAddress = publicKey?.toBase58() || "";

  // Notifications
  const { setOnPositionClosed } = useNotifications();

  // Positions
  const {
    positions,
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
    balance: demoBalance,
    tradeHistory,
    resetDemo,
  } = usePositions();

  const formattedTradeHistory: Trade[] = tradeHistory.map((t) => ({
    id: t.id,
    symbol: t.symbol,
    direction: t.direction,
    leverage: t.leverage,
    entryPrice: t.entryPrice,
    exitPrice: t.exitPrice,
    margin: t.margin,
    notional: t.notional,
    pnl: t.pnl,
    fee: t.fee,
    outcome: t.outcome,
    openedAt: t.openedAt,
    closedAt: t.closedAt,
  }));

  const handleReverseConfirm = () => {
    if (selectedPosition) reversePosition(selectedPosition, balanceUSD);
  };

  // Handle position close - open modal with trade details (keep positions tab active)
  const openHistoryOnPositionClose = useCallback(() => {
    // Just open the history modal for full details
    // Don't switch tabs - keep positions tab active since we're showing the modal
    setIsHistoryModalOpen(true);
  }, []);

  const handlePositionClose = useCallback((positionId: string) => {
    closePosition(positionId, openHistoryOnPositionClose);
  }, [closePosition, openHistoryOnPositionClose]);

  // Set global callback for auto-close-tp and other position closes
  useEffect(() => {
    setOnPositionClosed(openHistoryOnPositionClose);
    return () => {
      setOnPositionClosed(null);
    };
  }, [setOnPositionClosed, openHistoryOnPositionClose]);

  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === "perpetuals" || tab === "spot") setTradingMode(tab);
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const footerHeight = 24;
      const newHeight = window.innerHeight - e.clientY - footerHeight;
      const minHeight = 48;
      const maxHeight = window.innerHeight - 300;

      if (newHeight <= 60) {
        setBottomPanelHeight(minHeight);
        setIsBottomPanelExpanded(false);
      } else if (newHeight <= maxHeight) {
        setBottomPanelHeight(newHeight);
        setIsBottomPanelExpanded(true);
      } else {
        setBottomPanelHeight(maxHeight);
        setIsBottomPanelExpanded(true);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  return (
    <div className="h-screen overflow-hidden relative bg-[var(--bg-primary)]">
      <Header />

      <main className="relative z-10 pt-14 h-screen flex flex-col overflow-hidden">
        {/* Main Workspace Layout */}
        <div className="flex-1 flex gap-3 px-3 pb-6 pt-2 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none horizon-grid" />

          {/* Left Section: Toolbar + Analyzer */}
          <div className="flex-1 flex flex-col gap-0 min-w-0 z-10">
            {/* Analyzer Header / Left Toolbar */}
            <div className="shrink-0 flex items-center h-[52px]">
              <div className="flex items-center w-full h-full">
                <div className="flex items-center gap-3 w-full">
                  {/* Sidebar Toggle */}
                  <button
                    onClick={() => setIsLeftPanelHidden(!isLeftPanelHidden)}
                    className={`
                      w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95
                      ${isLeftPanelHidden
                        ? "bg-[#0D0D15]/60 backdrop-blur-2xl border border-white/[0.06] text-white/30 hover:text-white/60 shadow-2xl"
                        : "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-[0_0_15px_rgba(255,107,53,0.15)]"
                      }
                    `}
                  >
                    <Layout className={`w-4.5 h-4.5 transition-transform duration-500 ${isLeftPanelHidden ? "" : "rotate-180"}`} />
                  </button>

                  {/* Price Ticker Strip */}
                  <div className="flex items-center h-9 bg-[#0D0D15]/60 backdrop-blur-2xl border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden max-w-max">
                    <PriceTicker selectedSymbol={selectedSymbol} onSelectCoin={setSelectedSymbol} />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Row */}
            <div className="flex-1 flex gap-3 min-h-0 mt-2">
              {/* Left Column (Leaderboard/Quests) */}
              <div className={`flex-shrink-0 transition-all duration-300 ${isLeftPanelHidden ? "w-0 opacity-0 border-none" : "w-[240px] lg:w-[280px] border border-white/[0.05] bg-[var(--bg-card)] shadow-xl"} rounded-xl overflow-hidden backdrop-blur-2xl`}>
                <LeftPanel
                  userRank={profile?.stats?.rank || 9999999}
                  userPoints={profile?.stats?.points || 0}
                  walletAddress={walletAddress || "0x2e50ffd0"}
                  userAvatar={profile?.avatar || "pepe"}
                  username={profile?.username}
                  isHidden={isLeftPanelHidden}
                />
              </div>

              {/* Chart & Positions */}
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                <div className="flex-1 bg-[var(--bg-card)] border border-white/[0.05] rounded-xl overflow-hidden backdrop-blur-2xl shadow-xl min-h-0">
                  <PriceChart
                    symbol={`${selectedSymbol}-USDC`}
                    onSymbolChange={(sym) => setSelectedSymbol(sym.split("/")[0])}
                    activePosition={primaryPosition}
                    onReversePosition={openReverseModal}
                  />
                </div>

                <div onMouseDown={startResizing} className="h-1 w-full cursor-row-resize hover:bg-[var(--accent-primary)]/10 group transition-all flex items-center justify-center shrink-0">
                  <div className="w-16 h-0.5 rounded-full bg-white/10 group-hover:bg-[var(--accent-primary)] transition-all duration-300" />
                </div>

                <div style={{ height: `${bottomPanelHeight}px` }} className={`bg-[var(--bg-card)] border border-white/[0.05] rounded-xl overflow-hidden backdrop-blur-2xl flex flex-col shadow-xl shrink-0 ${!isResizing ? "transition-all duration-300" : ""}`}>
                  <div className="header h-12 border-b border-white/[0.05] bg-white/[0.01] flex items-center px-4">
                    <div className="flex gap-4">
                      <button onClick={() => setBottomPanelTab("positions")} className={`text-xs font-black uppercase tracking-tighter ${bottomPanelTab === "positions" ? "text-white" : "text-white/40"}`}>
                        Positions ({positions.length})
                      </button>
                      <button onClick={() => setBottomPanelTab("history")} className={`text-xs font-black uppercase tracking-tighter ${bottomPanelTab === "history" ? "text-white" : "text-white/40"}`}>
                        History ({tradeHistory.length})
                      </button>
                    </div>
                  </div>
                  {isBottomPanelExpanded && (
                    <div className="flex-1 overflow-auto">
                      {bottomPanelTab === "positions" ? (
                        <PositionsList isConnected={true} positions={positions} totalPnL={totalPnL} longCount={longCount} shortCount={shortCount} onViewAll={() => setIsPositionsModalOpen(true)} onClosePosition={handlePositionClose} onReversePosition={openReverseModal} maxVisible={10} />
                      ) : (
                        <TradeHistory isConnected={true} trades={formattedTradeHistory} onViewAll={() => setIsHistoryModalOpen(true)} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Integrated Trading Side Panel */}
          <div className="w-[280px] lg:w-[320px] xl:w-[380px] shrink-0 z-10 flex flex-col h-full">
            <div className="flex-1 bg-[var(--bg-card)] border border-white/[0.05] rounded-xl overflow-hidden backdrop-blur-2xl shadow-xl flex flex-col">
              {/* Tabs Section - Aligned with Left Toolbar Area */}
              <div className="shrink-0 border-b border-white/[0.05] flex flex-col justify-center h-[50px]">
                <TradingTabs
                  activeMode={tradingMode}
                  onModeChange={setTradingMode}
                />
              </div>

              {/* Action Panel Content */}
              <div className="flex-1 overflow-hidden">
                <TradingPanel
                  mode={tradingMode}
                  isConnected={connected}
                  onConnectWallet={() => setIsWalletModalOpen(true)}
                  balance={balance}
                  demoBalance={demoBalance}
                  currentPrice={currentPrice}
                  activePosition={primaryPosition}
                  onReversePosition={openReverseModal}
                  onOpenPosition={(direction, amount, leverage) => openPosition({ direction, size: amount, leverage, symbol: selectedSymbol })}
                  onResetDemo={resetDemo}
                  isDemoMode={true}
                />
              </div>
            </div>
          </div>
        </div>
      </main >

      <Footer />
      <MobileNav activeTab={mobileTab} onTabChange={handleMobileTabChange} />
      <WalletModal isOpen={isWalletModalOpen} onClose={closeWalletModal} />
      <PositionsModal isOpen={isPositionsModalOpen} onClose={() => setIsPositionsModalOpen(false)} positions={positions} onClosePosition={handlePositionClose} onReversePosition={openReverseModal} />
      <TradeHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} trades={tradeHistory} />
      <ReversePositionModal isOpen={isReverseModalOpen} onClose={closeReverseModal} position={selectedPosition} availableBalance={balanceUSD} onConfirm={handleReverseConfirm} onDeposit={openWalletModal} isProcessing={isProcessing} calculateRequirements={calculateReverseRequirements} />
      <NotificationContainer />
    </div >
  );
}
