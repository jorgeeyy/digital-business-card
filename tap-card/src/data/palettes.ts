import type { Palette, FontOption } from '../types';

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
  { id: 'georgia', label: 'Georgia', value: 'Georgia, "Times New Roman", serif', preview: 'Aa Bb Cc', style: { fontFamily: 'Georgia, serif' } },
  { id: 'system', label: 'System Sans', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', preview: 'Aa Bb Cc', style: { fontFamily: '-apple-system, sans-serif' } },
  { id: 'inter', label: 'Inter', value: '"Inter", -apple-system, sans-serif', preview: 'Aa Bb Cc', style: { fontFamily: 'Inter, sans-serif' } },
  { id: 'playfair', label: 'Playfair Display', value: '"Playfair Display", Georgia, serif', preview: 'Aa Bb Cc', style: { fontFamily: '"Playfair Display", serif' } },
];
