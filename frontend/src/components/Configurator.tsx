import { useState } from 'react';
import { useConfig } from '../store';
import BrandPicker from './BrandPicker';
import FontPicker from './FontPicker';
import LayoutPicker from './LayoutPicker';
import SocialRows from './SocialRows';
import UploadZone from './UploadZone';

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const TABS = [
  {
    id: 'brand',
    label: 'Brand',
    icon: (
      <svg {...iconProps}>
        <path d="M12 2.7l6.3 3.6v7.4L12 17.3l-6.3-3.6V6.3L12 2.7z" />
        <path d="M12 17.3v4M8.5 21.3h7" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'layout',
    label: 'Layout',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: (
      <svg {...iconProps}>
        <path d="M22 16.9v2.5a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 3.7 2 2 0 0 1 4.1 1.5h2.5a2 2 0 0 1 2 1.7c.1 1 .3 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.6 9.4a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
      </svg>
    ),
  },
  {
    id: 'socials',
    label: 'Social links',
    icon: (
      <svg {...iconProps}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </svg>
    ),
  },
  {
    id: 'media',
    label: 'Media',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Configurator() {
  const { config, updateConfig, setPortrait, setQr } = useConfig();
  const [active, setActive] = useState<TabId>('brand');

  return (
    <div className="form-panel">
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Configurator
        </div>
        <h1>
          Design your <span>card</span>
        </h1>
      </div>

      <div className="cfg-menu" role="tablist" aria-label="Configurator sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`cfg-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`cfg-panel-${tab.id}`}
            aria-label={tab.label}
            title={tab.label}
            className={`cfg-tab${active === tab.id ? ' active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      <div
        className="cfg-panel"
        role="tabpanel"
        id={`cfg-panel-${active}`}
        aria-labelledby={`cfg-tab-${active}`}
        key={active}
      >
        {active === 'brand' && (
          <>
            <BrandPicker />
            <div className="cfg-subhead">Typography</div>
            <FontPicker />
          </>
        )}
        {active === 'layout' && <LayoutPicker />}
        {active === 'contact' && (
          <>
            <div className="field">
              <label htmlFor="cfg-name">Full name</label>
              <input
                id="cfg-name"
                type="text"
                placeholder="John Doe"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="cfg-role">Role / title</label>
              <input
                id="cfg-role"
                type="text"
                placeholder="Founder & CEO"
                value={config.role}
                onChange={(e) => updateConfig({ role: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="cfg-location">Location</label>
              <input
                id="cfg-location"
                type="text"
                placeholder="New York, US"
                value={config.location}
                onChange={(e) => updateConfig({ location: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="cfg-phone">Phone</label>
              <input
                id="cfg-phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={config.phone}
                onChange={(e) => updateConfig({ phone: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="cfg-email">Email</label>
              <input
                id="cfg-email"
                type="email"
                placeholder="john@example.com"
                value={config.email}
                onChange={(e) => updateConfig({ email: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="cfg-website">Website</label>
              <input
                id="cfg-website"
                type="url"
                placeholder="https://example.com"
                value={config.website}
                onChange={(e) => updateConfig({ website: e.target.value })}
              />
            </div>
          </>
        )}
        {active === 'socials' && <SocialRows />}
        {active === 'media' && (
          <div className="upload-row">
            <UploadZone
              label="Portrait"
              file={config.portrait?.dataUrl || null}
              isVideoFile={config.portrait?.type === 'video'}
              onFile={(url, isVideo) => {
                if (!url) {
                  setPortrait(null);
                } else {
                  setPortrait({ type: isVideo ? 'video' : 'image', dataUrl: url });
                }
              }}
              isPortrait
            />
            <UploadZone label="QR code" file={config.qr || null} onFile={setQr} />
          </div>
        )}
      </div>
    </div>
  );
}
