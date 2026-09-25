import type { CardConfig } from '../types';
import { fonts } from '../data/fonts';
import { absoluteCardUrl, mediaSrc } from '../api';
import { generateQrSvg } from './qr';

function escHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function socialIcon(platform: string): string {
  const icons: Record<string, string> = {
    Instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>',
    LinkedIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 11v6M7 7v.01M11 11v6m0-4a3 3 0 0 1 6 0v4"/></svg>',
    'Twitter/X': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    TikTok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.15v-3.44a4.85 4.85 0 01-5.58-2.73z"/></svg>',
    YouTube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="4"/><polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none"/></svg>',
    GitHub: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>',
    Dribbble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72M19.13 5.09c-3.72 2.37-6.03 4.65-8.93 9.44M21.45 2.83c-6.84 3.46-12.62 5.25-17.72 5.64"/></svg>',
    Facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    Pinterest: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>',
    WhatsApp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.5 5.5 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
  };
  return icons[platform] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>';
}

export function generateCardHtml(
  config: CardConfig,
  username?: string | null,
  opts?: { preview?: boolean },
): string {
  const { colors, font, layout, name, role, location, phone, email, website, socials, portrait } = config;

  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'YN';

  const saveText = isLightColor(colors.accent) ? '#111111' : '#ffffff';
  const lineColor = hexToRgba(colors.accent, 0.18);
  const lineSoft = hexToRgba(colors.accent, 0.11);
  const creamDim = hexToRgba(colors.text, 0.64);

  const bgLight = isLightColor(colors.primary);
  const bgCenter = `color-mix(in srgb, ${colors.primary} ${bgLight ? 85 : 55}%, ${colors.accent})`;
  const bgMid = `color-mix(in srgb, ${colors.primary} ${bgLight ? 92 : 75}%, ${colors.accent})`;

  const cardUrl = username ? absoluteCardUrl(username) : null;

  const qrFabHtml = `<button class="qr-fab" id="qrFab" type="button" aria-label="Show QR code"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h.01M17 21h4v-4"/></svg></button>`;

  let imageHtml = '';
  if (portrait) {
    const media =
      portrait.type === 'video'
        ? `<video src="${mediaSrc(portrait.dataUrl)}" autoplay loop muted playsinline></video>`
        : `<img src="${mediaSrc(portrait.dataUrl)}" alt="Portrait" />`;
    imageHtml = cardUrl
      ? `<div class="flip" id="flip"><div class="flip-inner">
      <div class="portrait flip-front">${media}${qrFabHtml}</div>
      <button class="flip-back" id="flipBack" type="button" aria-label="Flip back to photo">
        <h3 class="flip-back-title">Scan to connect</h3>
        <div class="qrbox">${generateQrSvg(cardUrl)}</div>
        <p class="qr-hint">Tap to flip back</p>
      </button>
    </div></div>`
      : `<div class="flip"><div class="flip-inner"><div class="portrait flip-front">${media}</div></div></div>`;
  }
  const showQrButton = !(portrait && cardUrl);

  const monogramHidden = portrait ? 'hidden' : '';

  let quickHtml = '';
  if (phone) {
    quickHtml += `<a href="tel:${escHtml(phone)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span>Call</span></a>`;
  }
  if (email) {
    quickHtml += `<a href="mailto:${escHtml(email)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg><span>Email</span></a>`;
  }
  if (website) {
    const websiteUrl = website.startsWith('http') ? website : `https://${website}`;
    quickHtml += `<a href="${escHtml(websiteUrl)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><span>Website</span></a>`;
  }

  let socialsHtml = '';
  socials.forEach((soc) => {
    const url = soc.url || '';
    if (!url) return;
    const icon = socialIcon(soc.platform);
    const handle = soc.platform === 'WhatsApp' ? soc.handle : (soc.handle ? `@${soc.handle}` : url);
    socialsHtml += `<a class="social" href="${escHtml(url)}" target="_blank" rel="noopener">
      <div class="ic">${icon}</div>
      <div class="tx"><span class="name">${soc.platform}</span><span class="sub">${escHtml(handle)}</span></div>
      <div class="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
    </a>`;
  });

  const qrModalHtml = cardUrl
    ? `<div id="qrModal"><div class="sheet"><h3>Scan to connect</h3><p class="qr-url">${escHtml(cardUrl)}</p><div class="qrbox">${generateQrSvg(cardUrl)}</div><button class="close" onclick="document.getElementById('qrModal')?.classList.remove('show')" type="button">Done</button></div></div>`
    : `<div id="qrModal"><div class="sheet"><h3>Scan to connect</h3><p style="font-size:12px;color:${bgMid};">Publish your card to get your QR code</p><button class="close" onclick="document.getElementById('qrModal')?.classList.remove('show')" type="button">Done</button></div></div>`;

  const layoutStyles: Record<string, string> = {
    compact: `
  .flip{aspect-ratio:16/12;}
  .flip-back{padding:12px 10px;gap:5px;}
  .flip-back-title{font-size:15px;}
  .flip-back .qrbox{width:min(46%,166px);}
  .flip-back .qr-hint{font-size:10.5px;padding:5px 11px;}
  h1{font-size:28px;margin-bottom:6px;}
  .eyebrow{margin-bottom:10px;font-size:10px;}
  .role{margin-bottom:16px;font-size:12.5px;}
  .save{padding:13px 14px;font-size:14px;}
  .actions button{padding:11px 8px;font-size:12px;}
  .quick a{padding:10px 4px;font-size:10.5px;}
  .sep{margin:16px 2px 10px;}`,
    bold: `
  .flip{aspect-ratio:16/10;}
  .flip-back{padding:10px 8px;gap:4px;}
  .flip-back-title{font-size:14px;}
  .flip-back .qrbox{width:min(40%,148px);}
  .flip-back .qr-hint{font-size:10px;padding:5px 10px;}
  h1{font-size:40px;letter-spacing:-0.02em;margin-bottom:8px;}
  .role{font-size:14.5px;max-width:34ch;}` };
  const layoutCss = layoutStyles[layout] || '';

  const vcardLines: string[] = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${name || 'Your Name'}`];
  if (phone) vcardLines.push(`TEL:${phone}`);
  if (email) vcardLines.push(`EMAIL:${email}`);
  if (role) vcardLines.push(`TITLE:${role}`);
  if (website) vcardLines.push(`URL:${website}`);
  vcardLines.push('END:VCARD');
  const vcardData =
    'data:text/vcard;charset=utf-8,' +
    encodeURIComponent(vcardLines.join('\n')).replace(/'/g, '%27');

  const fontOption = fonts.find((f) => f.value === font);
  const fontStylesheet = fontOption?.google
    ? `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=${fontOption.google}&display=swap" rel="stylesheet" />`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
${fontStylesheet}
<title>${escHtml(name || 'Your Name')}</title>
<meta name="description" content="Save my contact, or follow along." />
<meta property="og:title" content="${escHtml(name || 'Your Name')}" />
<meta property="og:description" content="${escHtml(role || '')}" />
<meta property="og:type" content="profile" />
<style>
  :root{
    --ink:${colors.primary};--teal:${bgMid};--teal-2:${bgCenter};
    --line:${lineColor};--line-soft:${lineSoft};
    --sand:${colors.accent};--sand-deep:color-mix(in srgb, ${colors.accent} 85%, #000);
    --cream:${colors.text};--cream-dim:${creamDim};--r:16px;
    --serif:${font};
  }
  *{box-sizing:border-box;}
  html,body{margin:0;height:100svh;overflow:hidden;}
  body{height:100svh;font-family:var(--serif);color:var(--cream);background:radial-gradient(120% 80% at 50% -10%,var(--teal-2) 0%,var(--teal) 38%,var(--ink) 78%) fixed;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;display:flex;justify-content:center;padding:max(20px,env(safe-area-inset-top)) 18px max(28px,env(safe-area-inset-bottom));}
  .card{width:100%;max-width:420px;height:100svh;align-self:center;position:relative;padding:38px 26px 26px;border-radius:24px;background:linear-gradient(180deg,${hexToRgba(colors.cardBg, 0.7)},${hexToRgba(colors.cardBg, 0.5)} 40%);border:1px solid var(--line);box-shadow:0 1px 0 rgba(255,255,255,0.05) inset,0 30px 70px -30px rgba(0,0,0,0.6);overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
  .card::-webkit-scrollbar{display:none;}
  .eyebrow{position:relative;text-align:center;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:var(--sand);opacity:0.85;margin:0 0 18px;}
  .flip{position:relative;margin:-38px -26px 20px;aspect-ratio:4/5;perspective:1200px;}
  .flip-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .65s cubic-bezier(.35,.1,.25,1);}
  .flip.flipped .flip-inner{transform:rotateY(180deg);}
  .portrait{position:absolute;inset:0;overflow:hidden;background:${colors.cardBg};backface-visibility:hidden;-webkit-backface-visibility:hidden;}
  .qr-fab{position:absolute;top:14px;right:14px;z-index:3;width:40px;height:40px;padding:0;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(255,255,255,0.4);background:rgba(8,24,22,0.45);color:#fff;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);cursor:pointer;-webkit-appearance:none;appearance:none;}
  .qr-fab svg{width:19px;height:19px;}
  .qr-fab:active{transform:scale(0.93);}
  .flip-back{position:absolute;inset:0;transform:rotateY(180deg);backface-visibility:hidden;-webkit-backface-visibility:hidden;width:100%;height:100%;border:0;padding:16px 14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;background:var(--cream);cursor:pointer;font-family:var(--serif);text-align:center;-webkit-appearance:none;appearance:none;box-sizing:border-box;}
  .flip-back-title{margin:0;font-family:var(--serif);font-weight:400;font-size:17px;color:${bgMid};flex-shrink:0;}
  .flip-back .qrbox{width:min(56%,200px);flex-shrink:0;}
  .flip-back .qrbox svg{display:block;width:100%;height:auto;border-radius:8px;background:#ffffff;}
  .flip-back .qr-hint{flex-shrink:0;margin:3px 0 0;padding:6px 13px;border-radius:999px;background:rgba(0,0,0,0.08);font-size:11.5px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:${bgMid};opacity:1;}
  @media(prefers-reduced-motion:reduce){.flip-inner{transition:none;}}
  .portrait[hidden]{display:none;}
  .portrait img,.portrait video{width:100%;height:100%;object-fit:cover;object-position:center 18%;display:block;}
  .portrait::after{content:"";position:absolute;left:0;right:0;bottom:0;height:50%;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.5) 100%);pointer-events:none;}
  .monogram{position:relative;width:60px;height:60px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);background:radial-gradient(120% 120% at 30% 20%,${hexToRgba(colors.accent, 0.14)},${hexToRgba(colors.accent, 0.02)});font-family:var(--serif);font-size:24px;color:var(--sand);letter-spacing:0.02em;}
  .monogram[hidden]{display:none;}
  h1{position:relative;font-family:var(--serif);font-weight:400;font-size:34px;line-height:1.06;text-align:center;margin:0 0 10px;letter-spacing:-0.01em;}
  .role{position:relative;text-align:center;font-size:13.5px;line-height:1.5;color:var(--cream-dim);margin:0 auto 24px;max-width:30ch;}
  .save{position:relative;width:100%;border:0;cursor:pointer;font-family:var(--serif);font-size:15px;font-weight:650;letter-spacing:0.01em;color:${saveText};background:linear-gradient(180deg,var(--sand),var(--sand-deep));padding:16px 18px;border-radius:var(--r);display:flex;align-items:center;justify-content:center;gap:10px;}
  .save svg{width:18px;height:18px;}
  .actions{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;}
  .actions button{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px 10px;border-radius:13px;border:1px solid var(--line);background:rgba(255,255,255,0.025);color:var(--cream);font-family:var(--serif);font-size:13px;font-weight:600;letter-spacing:0.01em;cursor:pointer;}
  .actions svg{width:17px;height:17px;color:var(--sand);}
  .quick{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px;}
  .quick a{display:flex;flex-direction:column;align-items:center;gap:6px;padding:13px 6px;border-radius:13px;border:1px solid var(--line);background:rgba(255,255,255,0.025);color:var(--cream);text-decoration:none;font-size:11.5px;letter-spacing:0.02em;}
  .quick svg{width:19px;height:19px;color:var(--sand);}
  .sep{position:relative;display:flex;align-items:center;gap:12px;margin:24px 2px 14px;color:var(--sand);font-size:10.5px;letter-spacing:0.26em;text-transform:uppercase;opacity:0.7;}
  .sep::before,.sep::after{content:"";height:1px;flex:1;background:var(--line-soft);}
  .socials{position:relative;display:flex;flex-direction:column;gap:8px;}
  .social{display:flex;align-items:center;gap:14px;padding:13px 15px;border-radius:13px;border:1px solid var(--line-soft);background:rgba(255,255,255,0.02);color:var(--cream);text-decoration:none;}
  .social .ic{width:22px;height:22px;flex:none;color:var(--sand);display:grid;place-items:center;}
  .social .ic svg{width:20px;height:20px;}
  .social .tx{display:flex;flex-direction:column;line-height:1.25;}
  .social .tx .name{font-size:14px;font-weight:600;}
  .social .tx .sub{font-size:12px;color:var(--cream-dim);}
  .social .go{margin-left:auto;color:var(--sand);opacity:0.55;}
  .social .go svg{width:16px;height:16px;}
  footer{position:relative;margin-top:24px;text-align:center;font-size:11px;letter-spacing:0.04em;color:var(--cream-dim);}
  #qrModal{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,0.72);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);}
  #qrModal.show{display:flex;}
  #qrModal .sheet{background:var(--cream);border-radius:22px;padding:22px 22px 18px;max-width:320px;width:100%;text-align:center;box-shadow:0 30px 70px -20px rgba(0,0,0,0.7);}
  #qrModal .sheet h3{margin:0 0 4px;font-family:var(--serif);font-weight:400;font-size:20px;color:${bgMid};}
  #qrModal .sheet .qr-url{font-size:12px;color:${bgMid};word-break:break-all;margin-bottom:12px;}
  #qrModal .sheet .qrbox svg{display:block;width:100%;height:auto;border-radius:10px;background:#ffffff;}
  #qrModal .close{margin-top:14px;width:100%;border:0;border-radius:12px;cursor:pointer;padding:11px;font-family:var(--serif);font-size:13px;font-weight:650;color:var(--cream);background:var(--teal);}
  ${opts?.preview ? '' : `@media(prefers-reduced-motion:no-preference){.reveal{opacity:0;transform:translateY(10px);animation:rise .6s cubic-bezier(.2,.7,.2,1) forwards;}.reveal:nth-child(1){animation-delay:.02s}@keyframes rise{to{opacity:1;transform:none;}}}`}
  :focus-visible{outline:2px solid var(--sand);outline-offset:3px;border-radius:8px;}
  ${layoutCss}
</style>
</head>
<body>
  <main class="card">
    ${imageHtml}
    <div class="monogram reveal" ${monogramHidden}>${initials}</div>
    <h1 class="reveal">${escHtml(name || 'Your Name')}</h1>
    <p class="eyebrow reveal">${escHtml(location || 'Your City · Country')}</p>
    <p class="role reveal">${escHtml(role || '')}</p>
    <button class="save reveal" type="button" onclick="window.location.href='${vcardData}'">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      <span>Save my contact</span>
    </button>
    ${showQrButton ? `<div class="actions reveal">
      <button type="button" onclick="document.getElementById('qrModal')?.classList.add('show')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h.01M17 21h4v-4"/></svg>
        <span>QR</span>
      </button>
    </div>` : ''}
    ${quickHtml ? `<div class="quick reveal">${quickHtml}</div>` : ''}
    ${socialsHtml ? `<div class="sep reveal">Follow along</div><nav class="socials reveal">${socialsHtml}</nav>` : ''}
    <footer class="reveal"></footer>
  </main>
  ${qrModalHtml}
  <script>
    document.getElementById('qrModal')?.addEventListener('click',function(e){if(e.target===e.currentTarget)e.target.classList.remove('show')});
    document.getElementById('qrFab')?.addEventListener('click',function(e){
      e.stopPropagation();
      document.getElementById('flip')?.classList.add('flipped');
    });
    document.getElementById('flipBack')?.addEventListener('click',function(){
      document.getElementById('flip')?.classList.remove('flipped');
    });
  </script>
</body>
</html>`;
}
