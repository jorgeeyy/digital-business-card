export interface BrandColors {
  primary: string;
  accent: string;
  text: string;
  cardBg: string;
}

export type FontCategory = 'Serif' | 'Sans' | 'Display' | 'Handwriting' | 'Mono';

export interface FontOption {
  id: string;
  label: string;
  value: string;
  category: FontCategory;
  google?: string;
  preview: string;
  style: React.CSSProperties;
}

export interface SocialLink {
  platform: string;
  handle: string;
  url: string;
}

export interface Portrait {
  type: 'image' | 'video';
  dataUrl: string;
}

export type Layout = 'classic' | 'compact' | 'bold';

export interface CardConfig {
  colors: BrandColors;
  font: string;
  layout: Layout;
  name: string;
  role: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  socials: SocialLink[];
  portrait: Portrait | null;
}

export const socialPlatforms = [
  'Instagram',
  'LinkedIn',
  'Twitter/X',
  'TikTok',
  'YouTube',
  'GitHub',
  'Dribbble',
  'Facebook',
  'Pinterest',
  'WhatsApp',
] as const;

export type SocialPlatform = (typeof socialPlatforms)[number];
