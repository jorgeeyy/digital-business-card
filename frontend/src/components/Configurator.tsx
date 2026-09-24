import { useState } from 'react';
import { useConfig } from '../store';
import BrandPicker from './BrandPicker';
import FontPicker from './FontPicker';
import LayoutPicker from './LayoutPicker';
import SocialRows from './SocialRows';
import UploadZone from './UploadZone';

const TABS = [
  { id: 'brand', label: 'Brand' },
  { id: 'typography', label: 'Typography' },
  { id: 'layout', label: 'Layout' },
  { id: 'details', label: 'Details' },
  { id: 'contact', label: 'Contact' },
  { id: 'socials', label: 'Socials' },
  { id: 'media', label: 'Media' },
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
            className={`cfg-tab${active === tab.id ? ' active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
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
        {active === 'brand' && <BrandPicker />}
        {active === 'typography' && <FontPicker />}
        {active === 'layout' && <LayoutPicker />}
        {active === 'details' && (
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
          </>
        )}
        {active === 'contact' && (
          <>
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
