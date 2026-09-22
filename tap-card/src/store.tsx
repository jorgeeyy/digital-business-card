import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { CardConfig, BrandColors, Palette, SocialLink, Portrait } from './types';

const STORAGE_KEY = 'tap-card-config';

const defaultColors: BrandColors = {
  primary: '#1a1404',
  secondary: '#4a3707',
  secondary2: '#6b5410',
  accent: '#FFD633',
  accentDeep: '#E8B923',
  text: '#FBF3DC',
  textDim: '#a89a7a',
  cardBg: '#0a201f',
};

const defaultConfig: CardConfig = {
  paletteId: 'midnight-teal',
  colors: { ...defaultColors },
  font: 'Georgia, "Times New Roman", serif',
  layout: 'classic',
  name: '',
  role: '',
  location: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  socials: [],
  portrait: null,
  qr: null,
};

function loadConfig(): CardConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig;
    const parsed = JSON.parse(raw);
    return { ...defaultConfig, ...parsed };
  } catch {
    return defaultConfig;
  }
}

function saveConfig(config: CardConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch { /* quota exceeded or private mode */ }
}

interface ConfigContextType {
  config: CardConfig;
  updateConfig: (patch: Partial<CardConfig>) => void;
  updateColors: (colorPatch: Partial<BrandColors>) => void;
  setPalette: (palette: Palette) => void;
  addSocial: () => void;
  updateSocial: (index: number, field: keyof SocialLink, value: string) => void;
  removeSocial: (index: number) => void;
  setPortrait: (portrait: Portrait | null) => void;
  setQr: (qr: string | null) => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CardConfig>(loadConfig);

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const updateConfig = useCallback((patch: Partial<CardConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateColors = useCallback((colorPatch: Partial<BrandColors>) => {
    setConfig((prev) => ({
      ...prev,
      paletteId: 'custom',
      colors: { ...prev.colors, ...colorPatch },
    }));
  }, []);

  const setPalette = useCallback((palette: Palette) => {
    setConfig((prev) => ({
      ...prev,
      paletteId: palette.id,
      colors: { ...palette.colors },
    }));
  }, []);

  const addSocial = useCallback(() => {
    setConfig((prev) => {
      if (prev.socials.length >= 6) return prev;
      return {
        ...prev,
        socials: [...prev.socials, { platform: 'Instagram', handle: '', url: '' }],
      };
    });
  }, []);

  const updateSocial = useCallback((index: number, field: keyof SocialLink, value: string) => {
    setConfig((prev) => {
      const socials = [...prev.socials];
      socials[index] = { ...socials[index], [field]: value };
      return { ...prev, socials };
    });
  }, []);

  const removeSocial = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index),
    }));
  }, []);

  const setPortrait = useCallback((portrait: Portrait | null) => {
    setConfig((prev) => ({ ...prev, portrait }));
  }, []);

  const setQr = useCallback((qr: string | null) => {
    setConfig((prev) => ({ ...prev, qr }));
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        config,
        updateConfig,
        updateColors,
        setPalette,
        addSocial,
        updateSocial,
        removeSocial,
        setPortrait,
        setQr,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextType {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
