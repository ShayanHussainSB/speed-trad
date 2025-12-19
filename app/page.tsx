"use client";

import { useState } from "react";

export default function Home() {
  const [amount, setAmount] = useState("500");
  const [leverage, setLeverage] = useState("1000x");
  const [takeProfit, setTakeProfit] = useState("500%");
  const [positionType, setPositionType] = useState<"LONG" | "SHORT">("LONG");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-black border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="#C4F76C" stroke="#C4F76C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-white text-sm font-black tracking-tight uppercase" style={{ fontFamily: 'Arial, sans-serif', fontStyle: 'italic' }}>
                SPEED
              </span>
              <span className="text-white text-sm font-black tracking-tight uppercase -mt-1" style={{ fontFamily: 'Arial, sans-serif', fontStyle: 'italic' }}>
                TRADING
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-zinc-600 text-xs">by</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-zinc-600">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/>
              <circle cx="6" cy="6" r="2" fill="currentColor"/>
            </svg>
            <span className="text-zinc-600 text-xs font-medium">pandora</span>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-8">
          <button className="text-white text-sm font-bold hover:text-zinc-300 transition-colors">
            TRADE
          </button>
          <button className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">
            REFERRALS
          </button>
          <button className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">
            ABSTRACT CUP
          </button>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.5 1a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5zM1 7a1 1 0 0 1 1-1h3.5a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1zm8.5-3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
            </svg>
          </button>
          <button className="bg-[#C4F76C] text-black px-6 py-2 rounded-md font-black text-sm hover:bg-[#B8E965] transition-colors">
            Login
          </button>
        </div>
      </header>

      {/* Crypto Ticker Strip */}
      <div className="bg-[#0D0D0D] border-b border-zinc-900 px-6 py-3">
        <div className="flex gap-8 text-xs whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-[8px]">◆</span>
            </div>
            <span className="text-white font-medium">ETH</span>
            <span className="text-green-400 font-bold">+3.96%</span>
            <span className="text-zinc-400">$2,967.73</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">₿</span>
            </div>
            <span className="text-white font-medium">BTC</span>
            <span className="text-green-400 font-bold">+1.28%</span>
            <span className="text-zinc-400">$88,239.5</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)' }}>
              <span className="text-white text-[8px]">◎</span>
            </div>
            <span className="text-white font-medium">SOL</span>
            <span className="text-green-400 font-bold">+1.39%</span>
            <span className="text-zinc-400">$125.351</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center">
              <span className="text-white text-[8px]">✕</span>
            </div>
            <span className="text-white font-medium">XRP</span>
            <span className="text-red-400 font-bold">-0.13%</span>
            <span className="text-zinc-400">$1.8689</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-600 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">Ð</span>
            </div>
            <span className="text-white font-medium">DOGE</span>
            <span className="text-green-400 font-bold">+1.80%</span>
            <span className="text-zinc-400">$0.12819</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Top Traders */}
        <aside className="w-80 bg-[#0A0A0A] border-r border-zinc-900 px-5 py-6 flex flex-col">
          <div className="mb-8">
            {/* TOP TRADERS Header */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center">
                <span className="text-sm">📊</span>
              </div>
              <h2 className="text-white text-sm font-black tracking-wide">TOP TRADERS</h2>
            </div>

            {/* Table Header */}
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-3">
                <span className="text-zinc-600 text-xs font-medium">#</span>
                <span className="text-zinc-600 text-xs font-medium">Username</span>
              </div>
              <span className="text-zinc-600 text-xs font-medium">Points</span>
            </div>

            {/* Traders List */}
            <div className="space-y-0">
              {[
                { rank: 1, name: "lalchimaster", points: "178,167" },
                { rank: 2, name: "jellyfish", points: "81,304" },
                { rank: 3, name: "wabo", points: "39,320" },
                { rank: 4, name: "user_0x54444787", points: "35,315" },
                { rank: 5, name: "tothemoonxx", points: "35,234" },
                { rank: 6, name: "mindbuu", points: "32,607" },
                { rank: 7, name: "user_0xc60a6d12", points: "29,014" },
                { rank: 8, name: "firstmover", points: "22,558" },
                { rank: 9, name: "ShortOnly", points: "20,403" },
                { rank: 10, name: "392bb", points: "15,900" },
              ].map((trader) => (
                <div
                  key={trader.rank}
                  className="flex items-center justify-between py-3 px-2 hover:bg-zinc-900/30 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-5 ${
                      trader.rank === 1 ? 'text-yellow-500' :
                      trader.rank === 2 ? 'text-zinc-400' :
                      trader.rank === 3 ? 'text-orange-700' :
                      'text-zinc-600'
                    }`}>
                      {trader.rank}
                    </span>
                    <span className="text-zinc-300 text-sm">{trader.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C4F76C]"></div>
                    <span className="text-[#C4F76C] text-sm font-bold font-mono">{trader.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHALLENGES Section */}
          <div className="mt-auto pt-6 border-t border-zinc-900">
            <h2 className="text-white text-sm font-black tracking-wide mb-4">CHALLENGES</h2>
            <div className="bg-zinc-900/50 rounded-lg p-6 text-center border border-zinc-800">
              <p className="text-zinc-500 text-xs">Login to see challenges</p>
            </div>
          </div>
        </aside>

        {/* Center - Chart Area */}
        <main className="flex-1 bg-black flex flex-col">
          {/* Chart Header */}
          <div className="bg-[#0A0A0A] border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-green-400 rounded"></div>
                </div>
                <span className="text-white text-base font-bold">SOL-USDO</span>
                <button className="text-zinc-500 text-xs">▼</button>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500/10 rounded flex items-center justify-center">
                  <span className="text-red-400 text-xs">▼</span>
                </div>
                <span className="text-white text-2xl font-bold">$125.351</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px]">Change %</span>
                <span className="text-green-400 text-xs font-bold">+1.39%</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-zinc-500 text-xs hover:text-white">Chart Type</button>
              <button className="text-zinc-500 text-xs hover:text-white">✓</button>
              <button className="text-zinc-500 text-xs hover:text-white">⚙</button>
            </div>
          </div>

          {/* Chart Container */}
          <div className="flex-1 bg-black relative">
            {/* Grid Lines */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-zinc-900"
                  style={{ top: `${(i + 1) * 16.66}%` }}
                />
              ))}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-zinc-900"
                  style={{ left: `${(i + 1) * 8.33}%` }}
                />
              ))}
            </div>

            {/* Price Labels on Right */}
            <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-4 pr-2">
              {['125.440', '125.420', '125.400', '125.380', '125.360', '125.340', '125.320'].map((price, i) => (
                <span key={i} className="text-zinc-600 text-[10px] font-mono">{price}</span>
              ))}
            </div>

            {/* Chart Line */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
              <path
                d="M 0 380
                   C 50 390, 80 395, 100 380
                   C 120 365, 140 360, 160 365
                   C 180 370, 200 375, 240 380
                   C 280 385, 320 380, 360 370
                   C 400 360, 440 340, 480 280
                   C 520 220, 540 180, 560 160
                   C 580 140, 600 135, 640 140
                   C 680 145, 720 155, 760 175
                   C 800 195, 820 210, 840 230
                   C 860 250, 880 260, 920 270
                   C 960 280, 1000 285, 1040 295
                   C 1080 305, 1120 315, 1160 325
                   L 1200 330"
                fill="none"
                stroke="#C4F76C"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="1160" cy="325" r="6" fill="#C4F76C" />
            </svg>

            {/* Current Price Label */}
            <div className="absolute right-16 bottom-1/3" style={{ transform: 'translateY(50%)' }}>
              <div className="bg-[#C4F76C] text-black px-3 py-1 rounded-md flex items-center gap-2 text-xs font-bold shadow-lg">
                <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-green-400 rounded-full"></div>
                <span>125.350</span>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Trading Panel */}
        <aside className="w-80 bg-black border-l border-zinc-800 p-4 flex flex-col">
          {/* Demo Trading Preview Banner */}
          <div className="bg-[#2D3B14] border border-[#5A7A1F] rounded-lg px-4 py-2.5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#C4F76C] text-xs font-bold">Demo Trading Preview</span>
              <button className="w-4 h-4 rounded-full bg-[#5A7A1F] flex items-center justify-center">
                <span className="text-[#C4F76C] text-[10px]">?</span>
              </button>
            </div>
            <button className="text-[#5A7A1F] text-xs">▼</button>
          </div>

          <div className="space-y-5">
            {/* Enter Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white text-xs font-bold tracking-wider">ENTER AMOUNT</label>
                <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-md">
                  <span className="text-zinc-500 text-[10px]">💳</span>
                  <span className="text-white text-xs font-bold">$500.00 USDC</span>
                </div>
              </div>
              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <button className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-700">
                    <span className="text-lg">−</span>
                  </button>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">${amount}</div>
                  </div>
                  <button className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-700">
                    <span className="text-lg">+</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                <button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-2 rounded-lg text-xs font-medium border border-zinc-800">
                  25%
                </button>
                <button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-2 rounded-lg text-xs font-medium border border-zinc-800">
                  50%
                </button>
                <button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-2 rounded-lg text-xs font-medium border border-zinc-800">
                  75%
                </button>
                <button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-2 rounded-lg text-xs font-medium border border-zinc-800">
                  MAX
                </button>
              </div>
            </div>

            {/* Set Leverage */}
            <div>
              <label className="text-white text-xs font-bold tracking-wider mb-2 block">SET LEVERAGE</label>
              <div className="grid grid-cols-3 gap-2">
                <button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-3 rounded-lg text-sm font-bold border border-zinc-800">
                  500x
                </button>
                <button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-3 rounded-lg text-sm font-bold border border-zinc-800">
                  750x
                </button>
                <button className="bg-[#C4F76C] text-black py-3 rounded-lg text-sm font-black border-2 border-[#C4F76C]">
                  1000x
                </button>
              </div>
            </div>

            {/* Set Take Profit */}
            <div>
              <label className="text-white text-xs font-bold tracking-wider mb-2 block">SET TAKE PROFIT</label>
              <div className="grid grid-cols-3 gap-2">
                <button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-3 rounded-lg text-sm font-bold border border-zinc-800">
                  100%
                </button>
                <button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-3 rounded-lg text-sm font-bold border border-zinc-800">
                  300%
                </button>
                <button className="bg-[#C4F76C] text-black py-3 rounded-lg text-sm font-black border-2 border-[#C4F76C]">
                  500%
                </button>
              </div>
            </div>

            {/* Demo Trading Preview Scrolling Banner */}
            <div className="relative -mx-4 overflow-hidden bg-gradient-to-r from-transparent via-pink-500/5 to-transparent border-t border-b border-pink-500/20">
              <div className="py-2.5 flex gap-4 animate-scroll">
                <span className="text-pink-400 text-[10px] font-bold whitespace-nowrap">
                  🎮 DEMO TRADING PREVIEW
                </span>
                <span className="text-pink-400 text-[10px] font-bold whitespace-nowrap">
                  DEMO TRADING PREVIEW
                </span>
                <span className="text-pink-400 text-[10px] font-bold whitespace-nowrap">
                  DEMO TRADING PREVIEW
                </span>
                <span className="text-pink-400 text-[10px] font-bold whitespace-nowrap">
                  DEMO TRADING PREVIEW
                </span>
              </div>
            </div>

            {/* Long/Short Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`py-7 rounded-xl font-black text-xl tracking-wide transition-all ${
                  positionType === "LONG"
                    ? "bg-[#C4F76C] text-black shadow-lg shadow-[#C4F76C]/20"
                    : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"
                }`}
                onClick={() => setPositionType("LONG")}
              >
                LONG
              </button>
              <button
                className={`py-7 rounded-xl font-black text-xl tracking-wide transition-all ${
                  positionType === "SHORT"
                    ? "bg-[#FF3B8C] text-black shadow-lg shadow-[#FF3B8C]/20"
                    : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"
                }`}
                onClick={() => setPositionType("SHORT")}
              >
                SHORT
              </button>
            </div>

            {/* Trading Details */}
            <div className="space-y-3 text-xs pt-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Opening Fee</span>
                <span className="text-white font-medium">0.01% ($0.00)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Est. Entry Price</span>
                <span className="text-white font-medium">$125.175</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Take Profit (500%)</span>
                <span className="text-white font-medium">$125.801 / $124.549</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Liq. Price <span className="text-[#C4F76C]">(long)</span></span>
                <span className="text-white font-medium">$125.087</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Liq. Price <span className="text-pink-400">(short)</span></span>
                <span className="text-white font-medium">$125.263</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Positions Section */}
      <div className="bg-black border-t border-zinc-900">
        {/* Tabs */}
        <div className="flex gap-6 px-6 pt-4 border-b border-zinc-900">
          <button className="pb-3 relative">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-bold">POSITIONS</span>
              <span className="w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 text-xs font-bold">
                0
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
          </button>
          <button className="pb-3">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm font-medium">HISTORY</span>
              <span className="w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-600 text-xs font-bold">
                0
              </span>
            </div>
          </button>
        </div>

        {/* Table Header */}
        <div className="px-6 py-3 border-b border-zinc-900">
          <div className="grid grid-cols-9 gap-4 text-zinc-500 text-xs font-medium">
            <div>Market / Side</div>
            <div>Leverage</div>
            <div>Margin</div>
            <div>Position Size</div>
            <div>Entry Price</div>
            <div>Mark Price</div>
            <div>Liq Price</div>
            <div>PnL</div>
            <div>Take Profit</div>
            <div className="text-right">Action</div>
          </div>
        </div>

        {/* Empty State */}
        <div className="px-6 py-20 text-center">
          <p className="text-zinc-600 text-sm">You have no open position.</p>
        </div>
      </div>
    </div>
  );
}
