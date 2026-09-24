import type { Palette, FontOption, FontCategory } from '../types';

function googleFont(
  id: string,
  label: string,
  category: FontCategory,
  google: string,
  fallback: string,
): FontOption {
  const value = `"${label}", ${fallback}`;
  return {
    id,
    label,
    value,
    category,
    google,
    preview: 'Aa Bb Cc',
    style: { fontFamily: value },
  };
}

function systemFont(id: string, label: string, category: FontCategory, value: string): FontOption {
  return {
    id,
    label,
    value,
    category,
    preview: 'Aa Bb Cc',
    style: { fontFamily: value },
  };
}

const SERIF_FALLBACK = 'Georgia, serif';
const SANS_FALLBACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const DISPLAY_FALLBACK = 'Impact, sans-serif';
const SCRIPT_FALLBACK = 'cursive';
const MONO_FALLBACK = 'ui-monospace, monospace';

export const palettes: Palette[] = [
  {
    id: 'midnight-teal',
    name: 'Midnight Teal',
    colors: {
      primary: '#1a1404',
      secondary: '#4a3707',
      secondary2: '#6b5410',
      accent: '#FFD633',
      accentDeep: '#E8B923',
      text: '#FBF3DC',
      textDim: '#a89a7a',
      cardBg: '#0a201f',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    colors: {
      primary: '#0a1628',
      secondary: '#1a3a5c',
      secondary2: '#1e4a72',
      accent: '#4fc3f7',
      accentDeep: '#29b6f6',
      text: '#e3f2fd',
      textDim: '#78909c',
      cardBg: '#0d1b2a',
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    colors: {
      primary: '#0a1a0f',
      secondary: '#1a3a20',
      secondary2: '#224a28',
      accent: '#81c784',
      accentDeep: '#66bb6a',
      text: '#e8f5e9',
      textDim: '#7cb342',
      cardBg: '#0a1a0f',
    },
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    colors: {
      primary: '#fafafa',
      secondary: '#e0e0e0',
      secondary2: '#d0d0d0',
      accent: '#212121',
      accentDeep: '#333333',
      text: '#1a1a1a',
      textDim: '#666666',
      cardBg: '#ffffff',
    },
  },
  {
    id: 'bold-black',
    name: 'Bold Black',
    colors: {
      primary: '#0d0d0d',
      secondary: '#1a1a1a',
      secondary2: '#222222',
      accent: '#f5f5f5',
      accentDeep: '#e0e0e0',
      text: '#ffffff',
      textDim: '#999999',
      cardBg: '#0d0d0d',
    },
  },
  {
    id: 'sunset-warm',
    name: 'Sunset Warm',
    colors: {
      primary: '#1a0a04',
      secondary: '#5c2a0a',
      secondary2: '#7a3a10',
      accent: '#ff8a65',
      accentDeep: '#ff7043',
      text: '#fbe9e7',
      textDim: '#a1887f',
      cardBg: '#1a0a04',
    },
  },
];

export const fonts: FontOption[] = [
  systemFont('georgia', 'Georgia', 'Serif', 'Georgia, "Times New Roman", serif'),
  googleFont('playfair', 'Playfair Display', 'Serif', 'Playfair+Display', SERIF_FALLBACK),
  googleFont('lora', 'Lora', 'Serif', 'Lora', SERIF_FALLBACK),
  googleFont('merriweather', 'Merriweather', 'Serif', 'Merriweather', SERIF_FALLBACK),
  googleFont('libre-baskerville', 'Libre Baskerville', 'Serif', 'Libre+Baskerville', SERIF_FALLBACK),
  googleFont('cormorant', 'Cormorant Garamond', 'Serif', 'Cormorant+Garamond', SERIF_FALLBACK),
  googleFont('eb-garamond', 'EB Garamond', 'Serif', 'EB+Garamond', SERIF_FALLBACK),
  googleFont('crimson-pro', 'Crimson Pro', 'Serif', 'Crimson+Pro', SERIF_FALLBACK),
  googleFont('source-serif', 'Source Serif 4', 'Serif', 'Source+Serif+4', SERIF_FALLBACK),
  googleFont('dm-serif-display', 'DM Serif Display', 'Serif', 'DM+Serif+Display', SERIF_FALLBACK),
  googleFont('fraunces', 'Fraunces', 'Serif', 'Fraunces', SERIF_FALLBACK),
  googleFont('bodoni', 'Bodoni Moda', 'Serif', 'Bodoni+Moda', SERIF_FALLBACK),
  googleFont('spectral', 'Spectral', 'Serif', 'Spectral', SERIF_FALLBACK),

  systemFont('system', 'System Sans', 'Sans', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'),
  {
    ...googleFont('inter', 'Inter', 'Sans', 'Inter', SANS_FALLBACK),
    value: '"Inter", -apple-system, sans-serif',
    style: { fontFamily: '"Inter", -apple-system, sans-serif' },
  },
  googleFont('poppins', 'Poppins', 'Sans', 'Poppins', SANS_FALLBACK),
  googleFont('montserrat', 'Montserrat', 'Sans', 'Montserrat', SANS_FALLBACK),
  googleFont('work-sans', 'Work Sans', 'Sans', 'Work+Sans', SANS_FALLBACK),
  googleFont('dm-sans', 'DM Sans', 'Sans', 'DM+Sans', SANS_FALLBACK),
  googleFont('rubik', 'Rubik', 'Sans', 'Rubik', SANS_FALLBACK),
  googleFont('manrope', 'Manrope', 'Sans', 'Manrope', SANS_FALLBACK),
  googleFont('outfit', 'Outfit', 'Sans', 'Outfit', SANS_FALLBACK),
  googleFont('nunito', 'Nunito', 'Sans', 'Nunito', SANS_FALLBACK),
  googleFont('raleway', 'Raleway', 'Sans', 'Raleway', SANS_FALLBACK),
  googleFont('karla', 'Karla', 'Sans', 'Karla', SANS_FALLBACK),
  googleFont('space-grotesk', 'Space Grotesk', 'Sans', 'Space+Grotesk', SANS_FALLBACK),
  googleFont('jakarta', 'Plus Jakarta Sans', 'Sans', 'Plus+Jakarta+Sans', SANS_FALLBACK),
  googleFont('barlow', 'Barlow', 'Sans', 'Barlow', SANS_FALLBACK),
  googleFont('quicksand', 'Quicksand', 'Sans', 'Quicksand', SANS_FALLBACK),
  googleFont('roboto', 'Roboto', 'Sans', 'Roboto', SANS_FALLBACK),
  googleFont('open-sans', 'Open Sans', 'Sans', 'Open+Sans', SANS_FALLBACK),

  googleFont('bebas', 'Bebas Neue', 'Display', 'Bebas+Neue', DISPLAY_FALLBACK),
  googleFont('oswald', 'Oswald', 'Display', 'Oswald', DISPLAY_FALLBACK),
  googleFont('anton', 'Anton', 'Display', 'Anton', DISPLAY_FALLBACK),
  googleFont('archivo-black', 'Archivo Black', 'Display', 'Archivo+Black', DISPLAY_FALLBACK),
  googleFont('abril', 'Abril Fatface', 'Display', 'Abril+Fatface', SERIF_FALLBACK),
  googleFont('righteous', 'Righteous', 'Display', 'Righteous', SANS_FALLBACK),

  googleFont('pacifico', 'Pacifico', 'Handwriting', 'Pacifico', SCRIPT_FALLBACK),
  googleFont('caveat', 'Caveat', 'Handwriting', 'Caveat', SCRIPT_FALLBACK),
  googleFont('lobster', 'Lobster', 'Handwriting', 'Lobster', SCRIPT_FALLBACK),
  googleFont('dancing-script', 'Dancing Script', 'Handwriting', 'Dancing+Script', SCRIPT_FALLBACK),

  googleFont('jetbrains', 'JetBrains Mono', 'Mono', 'JetBrains+Mono', MONO_FALLBACK),
  googleFont('space-mono', 'Space Mono', 'Mono', 'Space+Mono', MONO_FALLBACK),
  googleFont('ibm-plex-mono', 'IBM Plex Mono', 'Mono', 'IBM+Plex+Mono', MONO_FALLBACK),
];

export const fontCategories: FontCategory[] = ['Serif', 'Sans', 'Display', 'Handwriting', 'Mono'];
