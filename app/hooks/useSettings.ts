"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export interface UserSettings {
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
};

export function useSettings() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() || "";
  const storageKey = walletAddress ? `settings_${walletAddress}` : null;

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    if (!storageKey) {
      setSettings(DEFAULT_SETTINGS);
      setIsLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as UserSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setSettings(DEFAULT_SETTINGS);
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save settings to localStorage
  const updateSettings = useCallback(
    (newSettings: Partial<UserSettings>) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cd4ad0f0-173d-40d3-9819-10ee8b1f7173',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSettings.ts:47',message:'updateSettings called',data:{newSettings,currentSettings:settings,storageKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const updated = { ...settings, ...newSettings };
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cd4ad0f0-173d-40d3-9819-10ee8b1f7173',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSettings.ts:50',message:'updateSettings setSettings called',data:{updated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      setSettings(updated);

      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/cd4ad0f0-173d-40d3-9819-10ee8b1f7173',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSettings.ts:56',message:'localStorage.setItem called',data:{storageKey,updated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        } catch (error) {
          console.error("Failed to save settings:", error);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/cd4ad0f0-173d-40d3-9819-10ee8b1f7173',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSettings.ts:59',message:'localStorage.setItem failed',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        }
      }
    },
    [settings, storageKey]
  );

  const setSoundEnabled = useCallback(
    (enabled: boolean) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cd4ad0f0-173d-40d3-9819-10ee8b1f7173',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSettings.ts:63',message:'setSoundEnabled called',data:{enabled,currentSoundEnabled:settings.soundEnabled,storageKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      updateSettings({ soundEnabled: enabled });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cd4ad0f0-173d-40d3-9819-10ee8b1f7173',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSettings.ts:66',message:'setSoundEnabled updateSettings called',data:{enabled},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    },
    [updateSettings, settings.soundEnabled, storageKey]
  );

  return {
    settings,
    isLoaded,
    soundEnabled: settings.soundEnabled,
    setSoundEnabled,
    updateSettings,
  };
}

