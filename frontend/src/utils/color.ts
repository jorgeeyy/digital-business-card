import type { BrandColors } from '../types';

export function isHexColor(hex: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function contrastRatio(a: string, b: string): number {
  const la = hexToRgb(a);
  const lb = hexToRgb(b);
  const lumA = 0.2126 * channelLuminance(la.r) + 0.7152 * channelLuminance(la.g) + 0.0722 * channelLuminance(la.b);
  const lumB = 0.2126 * channelLuminance(lb.r) + 0.7152 * channelLuminance(lb.g) + 0.0722 * channelLuminance(lb.b);
  const [hi, lo] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (hi + 0.05) / (lo + 0.05);
}

export function mixHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const mix = (x: number, y: number) => Math.round(x * t + y * (1 - t));
  const to2 = (n: number) => n.toString(16).padStart(2, '0');
  return `#${to2(mix(ca.r, cb.r))}${to2(mix(ca.g, cb.g))}${to2(mix(ca.b, cb.b))}`;
}

export function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to2 = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${to2(f(0))}${to2(f(8))}${to2(f(4))}`;
}

export function randomPalette(): BrandColors {
  const h = Math.floor(Math.random() * 360);
  const dark = Math.random() < 0.75;
  const sat = 65 + Math.random() * 25;
  if (dark) {
    return {
      primary: hslToHex(h, 18 + Math.random() * 16, 6 + Math.random() * 4),
      accent: hslToHex(h, sat, 54 + Math.random() * 8),
      text: hslToHex(h, 18, 93 + Math.random() * 4),
      cardBg: hslToHex(h, 24 + Math.random() * 14, 10 + Math.random() * 4),
    };
  }
  return {
    primary: hslToHex(h, 14 + Math.random() * 16, 95 + Math.random() * 3),
    accent: hslToHex(h, sat, 42 + Math.random() * 8),
    text: hslToHex(h, 22, 11 + Math.random() * 5),
    cardBg: hslToHex(h, 18 + Math.random() * 12, 86 + Math.random() * 5),
  };
}
