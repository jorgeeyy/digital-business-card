import { useConfig } from '../store';
import { socialPlatforms } from '../types';

function getBaseUrl(platform: string, handle: string): string {
  const cleaned = handle.replace(/^@/, '').trim();
  if (!cleaned) return '';
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

export default function SocialRows() {
  const { config, addSocial, updateSocial, removeSocial } = useConfig();
  const { socials } = config;

  const handlePlatformChange = (index: number, platform: string) => {
    const handle = socials[index].handle;
    updateSocial(index, 'platform', platform);
    if (handle) {
      const url = getBaseUrl(platform, handle);
      if (url) updateSocial(index, 'url', url);
    }
  };

  const handleHandleChange = (index: number, value: string) => {
    const platform = socials[index].platform;
    updateSocial(index, 'handle', value);
    const url = getBaseUrl(platform, value);
    if (url) {
      updateSocial(index, 'url', url);
    } else if (value.startsWith('http://') || value.startsWith('https://')) {
      updateSocial(index, 'url', value);
    } else {
      updateSocial(index, 'url', '');
    }
  };

  return (
    <>
      <div className="social-rows">
        {socials.map((soc, i) => (
          <div className="social-row" key={i}>
            <label className="visually-hidden" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              Platform
            </label>
            <select
              value={soc.platform}
              aria-label={`Platform for link ${i + 1}`}
              onChange={(e) => handlePlatformChange(i, e.target.value)}
            >
              {socialPlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              type={soc.platform === 'WhatsApp' ? 'tel' : 'text'}
              placeholder={soc.platform === 'WhatsApp' ? 'Phone with country code' : 'Handle or URL'}
              value={soc.handle}
              aria-label={`Handle for ${soc.platform}`}
              onChange={(e) => handleHandleChange(i, e.target.value)}
            />
            <button
              type="button"
              className="social-remove"
              aria-label={`Remove ${soc.platform} link`}
              onClick={() => removeSocial(i)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {socials.length < 6 && (
        <button type="button" className="social-add" onClick={addSocial}>
          + Add social link
        </button>
      )}
    </>
  );
}
