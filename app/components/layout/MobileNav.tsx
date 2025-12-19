"use client";

import { TrendingUp, ArrowLeftRight, History, User } from "lucide-react";

type TabType = "perpetuals" | "spot" | "history" | "account";

interface MobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navItems = [
  { id: "perpetuals" as TabType, icon: TrendingUp, label: "Perps" },
  { id: "spot" as TabType, icon: ArrowLeftRight, label: "Spot" },
  { id: "history" as TabType, icon: History, label: "History" },
  { id: "account" as TabType, icon: User, label: "Account" },
];

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-[var(--border-subtle)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl
                transition-all duration-200 min-w-[64px]
                ${isActive
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--text-tertiary)] active:text-[var(--text-secondary)]"
                }
              `}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <div className="absolute inset-0 blur-md bg-[var(--accent-primary)] opacity-50 -z-10" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Safe area for devices with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
