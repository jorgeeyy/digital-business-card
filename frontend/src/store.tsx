import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { api, type CardRecord } from './api';
import { useAuth } from './auth';
import type { CardConfig, BrandColors, Palette, SocialLink, Portrait } from './types';

function storageKey(userId: number): string {
  return `tap-card-config:u:${userId}`;
}

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
  email: '',
  website: '',
  socials: [],
  portrait: null,
};

function loadLocalConfig(userId: number | null): CardConfig {
  if (userId == null) return { ...defaultConfig };
  try {
    localStorage.removeItem('tap-card-config');
    localStorage.removeItem('tap-card-config:anon');
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { ...defaultConfig };
    const parsed = JSON.parse(raw);
    return { ...defaultConfig, ...parsed };
  } catch {
    return { ...defaultConfig };
  }
}

function saveLocalConfig(config: CardConfig, userId: number | null) {
  if (userId == null) return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(config));
  } catch { /* quota exceeded or private mode */ }
}

function clearLocalConfig(userId: number | null) {
  if (userId == null) return;
  try {
    localStorage.removeItem(storageKey(userId));
  } catch { /* ignore */ }
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface ConfigContextType {
  config: CardConfig;
  updateConfig: (patch: Partial<CardConfig>) => void;
  updateColors: (colorPatch: Partial<BrandColors>) => void;
  setPalette: (palette: Palette) => void;
  addSocial: () => void;
  updateSocial: (index: number, field: keyof SocialLink, value: string) => void;
  removeSocial: (index: number) => void;
  setPortrait: (portrait: Portrait | null) => void;
  card: CardRecord | null;
  cardLoading: boolean;
  saveStatus: SaveStatus;
  setLatestHtml: (html: string) => void;
  saveNow: (html: string) => Promise<CardRecord | null>;
  publish: (username: string, html: string) => Promise<CardRecord>;
  reloadCard: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const authReady = !authLoading;

  const [config, setConfig] = useState<CardConfig>(() => ({ ...defaultConfig }));
  const [card, setCard] = useState<CardRecord | null>(null);
  const [cardLoading, setCardLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestHtml = useRef<string>('');
  const hydrated = useRef(false);
  const prevUserId = useRef<number | null | undefined>(undefined);
  const loadedForUser = useRef<number | null | undefined>(undefined);

  const reloadCard = useCallback(async () => {
    setCardLoading(true);
    try {
      const cards = await api.listCards();
      const c = cards[0] || null;
      setCard(c);
      if (c && c.config && c.config !== '{}' && !hydrated.current) {
        try {
          const serverConfig = JSON.parse(c.config) as Partial<CardConfig>;
          setConfig({ ...defaultConfig, ...serverConfig });
        } catch { /* keep local */ }
      }
      hydrated.current = true;
    } catch {
      hydrated.current = true;
    } finally {
      setCardLoading(false);
    }
  }, []);

  // Switch draft scope when auth resolves or the user changes
  useEffect(() => {
    if (!authReady) return;

    const prev = prevUserId.current;

    // Logout: drop that user's local draft (server autosave is the source of truth)
    if (prev !== undefined && prev !== null && userId === null) {
      clearLocalConfig(prev);
    }

    prevUserId.current = userId;
    loadedForUser.current = undefined;
    hydrated.current = false;
    latestHtml.current = '';
    if (saveTimer.current) clearTimeout(saveTimer.current);

    setCard(null);
    setSaveStatus('idle');
    setConfig(loadLocalConfig(userId));
    loadedForUser.current = userId;
    reloadCard();
  }, [authReady, userId, reloadCard]);

  // Persist draft only after the correct user's config has been loaded
  useEffect(() => {
    if (!authReady) return;
    if (loadedForUser.current !== userId) return;
    saveLocalConfig(config, userId);
  }, [config, userId, authReady]);

  const performSave = useCallback(
    async (html: string): Promise<CardRecord | null> => {
      setSaveStatus('saving');
      try {
        const configStr = JSON.stringify(config);
        let saved: CardRecord;
        if (card) {
          saved = await api.updateCard(card.id, configStr, html);
        } else {
          saved = await api.createCard(configStr, html);
        }
        setCard(saved);
        setSaveStatus('saved');
        return saved;
      } catch {
        setSaveStatus('error');
        return null;
      }
    },
    [card, config],
  );

  useEffect(() => {
    if (!authReady || !hydrated.current || cardLoading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (latestHtml.current) performSave(latestHtml.current);
    }, 2000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, cardLoading, authReady]);

  const setLatestHtml = useCallback((html: string) => {
    latestHtml.current = html;
  }, []);

  const saveNow = useCallback(
    async (html: string) => {
      latestHtml.current = html;
      return performSave(html);
    },
    [performSave],
  );

  const publish = useCallback(
    async (username: string, html: string) => {
      latestHtml.current = html;
      setSaveStatus('saving');
      let active = card;
      if (!active) {
        active = await api.createCard(JSON.stringify(config), html);
      } else {
        active = await api.updateCard(active.id, JSON.stringify(config), html);
      }
      setCard(active);
      const published = await api.publishCard(active.id, username);
      setCard(published);
      setSaveStatus('saved');
      return published;
    },
    [card, config],
  );

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
        card,
        cardLoading,
        saveStatus,
        setLatestHtml,
        saveNow,
        publish,
        reloadCard,
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
