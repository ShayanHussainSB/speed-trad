"use client";

import { TrendingUp, ArrowLeftRight, BarChart3, History, User } from "lucide-react";

type TabType = "perpetuals" | "spot" | "positions" | "activity" | "account";

interface MobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navItems = [
  { id: "perpetuals" as TabType, icon: TrendingUp, label: "Perps", color: "var(--warm-yellow)" },
  { id: "spot" as TabType, icon: ArrowLeftRight, label: "Spot", color: "var(--cyan-glow)" },
  { id: "positions" as TabType, icon: BarChart3, label: "Positions", color: "var(--sunset-orange)" },
  { id: "activity" as TabType, icon: History, label: "Activity", color: "var(--electric-purple)" },
  { id: "account" as TabType, icon: User, label: "Account", color: "var(--hot-pink)" },
];

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-dark">
      {/* Neon top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--sunset-orange)]/40 to-transparent" />
      
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl
                transition-all duration-300 min-w-0 flex-1 relative
                ${isActive
                  ? ""
                  : "text-[var(--text-muted)] active:scale-95"
                }
              `}
              style={{ 
                color: isActive ? item.color : undefined,
                fontFamily: 'var(--font-rajdhani)'
              }}
            >
              {/* Active indicator glow */}
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-xl opacity-15 -z-10"
                  style={{ backgroundColor: item.color }}
                />
              )}
              
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${isActive ? "scale-110" : ""}`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {isActive && (
                  <div 
                    className="absolute inset-0 blur-lg opacity-60 -z-10"
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? "" : "opacity-70"}`}>
                {item.label}
              </span>
              
              {/* Active dot indicator */}
              {isActive && (
                <div 
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                  style={{ 
                    backgroundColor: item.color,
                    boxShadow: `0 0 8px ${item.color}`
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Safe area for devices with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)] bg-[var(--bg-elevated)]" />
    </nav>
  );
}
