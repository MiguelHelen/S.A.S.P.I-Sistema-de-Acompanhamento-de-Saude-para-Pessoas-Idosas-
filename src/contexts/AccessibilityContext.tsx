import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontScaleLevel = 1 | 1.15 | 1.3;

interface AccessibilityContextData {
  fontScale: FontScaleLevel;
  highContrast: boolean;
  simplifiedMode: boolean;
  setFontScale: (scale: FontScaleLevel) => Promise<void>;
  setHighContrast: (value: boolean) => Promise<void>;
  setSimplifiedMode: (value: boolean) => Promise<void>;
  fs: (baseSize: number) => number;
}

const STORAGE_KEY = 'saspi_accessibility_prefs';

const defaultContext: AccessibilityContextData = {
  fontScale: 1,
  highContrast: false,
  simplifiedMode: false,
  setFontScale: async () => {},
  setHighContrast: async () => {},
  setSimplifiedMode: async () => {},
  fs: (baseSize: number) => baseSize,
};

const AccessibilityContext = createContext<AccessibilityContextData>(defaultContext);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScaleState] = useState<FontScaleLevel>(1);
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [simplifiedMode, setSimplifiedModeState] = useState<boolean>(false);

  useEffect(() => {
    async function loadPrefs() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.fontScale) setFontScaleState(parsed.fontScale);
          if (typeof parsed.highContrast === 'boolean') setHighContrastState(parsed.highContrast);
          if (typeof parsed.simplifiedMode === 'boolean') setSimplifiedModeState(parsed.simplifiedMode);
        }
      } catch (e) {
        console.warn('Erro ao carregar preferências de acessibilidade:', e);
      }
    }
    loadPrefs();
  }, []);

  async function savePrefs(next: {
    fontScale: FontScaleLevel;
    highContrast: boolean;
    simplifiedMode: boolean;
  }) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Erro ao salvar preferências de acessibilidade:', e);
    }
  }

  const setFontScale = async (scale: FontScaleLevel) => {
    setFontScaleState(scale);
    await savePrefs({ fontScale: scale, highContrast, simplifiedMode });
  };

  const setHighContrast = async (value: boolean) => {
    setHighContrastState(value);
    await savePrefs({ fontScale, highContrast: value, simplifiedMode });
  };

  const setSimplifiedMode = async (value: boolean) => {
    setSimplifiedModeState(value);
    await savePrefs({ fontScale, highContrast, simplifiedMode: value });
  };

  const fs = (baseSize: number) => Math.round(baseSize * fontScale);

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        highContrast,
        simplifiedMode,
        setFontScale,
        setHighContrast,
        setSimplifiedMode,
        fs,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export function useAccessibility() {
  return useContext(AccessibilityContext);
}