import type { FontOption, FontCategory } from '../types';

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
