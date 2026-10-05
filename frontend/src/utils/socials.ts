import {
  siInstagram,
  siX,
  siTiktok,
  siYoutube,
  siGithub,
  siDribbble,
  siFacebook,
  siPinterest,
  siWhatsapp,
} from 'simple-icons';
import { websiteSchema, phoneSchema, validateField } from '../validation';

export function getBaseUrl(platform: string, handle: string): string {
  const cleaned = handle.replace(/^@/, '').trim();
  if (!cleaned) return '';
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  const map: Record<string, string> = {
    Instagram: `https://instagram.com/${cleaned}`,
    LinkedIn: `https://linkedin.com/in/${cleaned}`,
    'Twitter/X': `https://x.com/${cleaned}`,
    TikTok: `https://tiktok.com/@${cleaned}`,
    YouTube: `https://youtube.com/@${cleaned}`,
    GitHub: `https://github.com/${cleaned}`,
    Dribbble: `https://dribbble.com/${cleaned}`,
    Facebook: `https://facebook.com/${cleaned}`,
    Pinterest: `https://pinterest.com/${cleaned}`,
    WhatsApp: `https://wa.me/${cleaned}`,
  };
  return map[platform] || '';
}

const BRAND_PATHS: Record<string, string> = {
  Instagram: siInstagram.path,
  'Twitter/X': siX.path,
  TikTok: siTiktok.path,
  YouTube: siYoutube.path,
  GitHub: siGithub.path,
  Dribbble: siDribbble.path,
  Facebook: siFacebook.path,
  Pinterest: siPinterest.path,
  WhatsApp: siWhatsapp.path,
  // LinkedIn's mark was removed from simple-icons (trademark policy); local path.
  LinkedIn:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
};

export function socialIconSvg(platform: string): string {
  const path = BRAND_PATHS[platform];
  if (!path) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>'
    );
  }
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="${path}"/></svg>`;
}

/** Returns an error message, or null when the handle is valid. */
export function socialHandleError(platform: string, handle: string): string | null {
  const cleaned = handle.trim();
  if (!cleaned) return `Add your ${platform} handle`;
  if (/^https?:\/\//i.test(cleaned)) return validateField(websiteSchema, cleaned);
  if (platform === 'WhatsApp') return validateField(phoneSchema, cleaned);
  if (/\s/.test(cleaned)) return 'Handles cannot contain spaces';
  return null;
}
