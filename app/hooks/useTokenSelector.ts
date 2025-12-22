"use client";

import { useState, useEffect, useCallback } from "react";
import type { Token } from "@/app/components/trading/TokenSelectorModal";

export function useTokenSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // Global keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const handleSelectToken = useCallback((token: Token) => {
    setSelectedToken(token);
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    selectedToken,
    openModal,
    closeModal,
    handleSelectToken,
    setSelectedToken,
  };
}

export default useTokenSelector;
