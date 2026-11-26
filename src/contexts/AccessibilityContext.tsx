import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontScaleLevel = 1 | 1.15 | 1.3;

export interface ThemeColors {
  background: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
}

interface AccessibilityContextData {
  fontScale: FontScaleLevel;
  highContrast: boolean;
  simplifiedMode: boolean;
  colors: ThemeColors;
  setFontScale: (scale: FontScaleLevel) => Promise<void>;
  setHighContrast: (value: boolean) => Promise<void>;
  setSimplifiedMode: (value: boolean) => Promise<void>;
  fs: (baseSize: number) => number;
}

const STORAGE_KEY = 'saspi_accessibility_prefs';

const defaultColors: ThemeColors = {
  background: '#F2F7FB',
  card: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0A2540',
  textSecondary: '#64748B',
  primary: '#159B87',
};

const defaultContext: AccessibilityContextData = {
  fontScale: 1,
  highContrast: false,
  simplifiedMode: false,
  colors: defaultColors,
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

  const colors: ThemeColors = highContrast
    ? {
        background: '#000000',
        card: '#111827',
        border: '#38BDF8',
        textPrimary: '#FFFFFF',
        textSecondary: '#E2E8F0',
        primary: '#38BDF8',
      }
    : defaultColors;

  const fs = (baseSize: number) => Math.round(baseSize * fontScale);

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        highContrast,
        simplifiedMode,
        colors,
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