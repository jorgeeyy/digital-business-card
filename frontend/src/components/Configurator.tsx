import { useState } from 'react';
import { useConfig } from '../store';
import BrandPicker from './BrandPicker';
import FontPicker from './FontPicker';
import LayoutPicker from './LayoutPicker';
import SocialRows from './SocialRows';
import UploadZone from './UploadZone';

const SECTIONS = [
  { id: 'brand', title: 'Brand', defaultOpen: true },
  { id: 'typography', title: 'Typography', defaultOpen: false },
  { id: 'layout', title: 'Layout', defaultOpen: false },
  { id: 'details', title: 'Details', defaultOpen: true },
  { id: 'contact', title: 'Contact', defaultOpen: false },
  { id: 'socials', title: 'Social links', defaultOpen: false },
  { id: 'media', title: 'Media', defaultOpen: false },
] as const;

function Chevron() {
  return (
    <svg className="section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Configurator() {
  const { config, updateConfig, setPortrait, setQr } = useConfig();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SECTIONS.map((s) => [s.id, s.defaultOpen])),
  );

  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

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

      {SECTIONS.map((section) => (
        <section key={section.id} className={`section${open[section.id] ? ' open' : ''}`}>
          <button
            type="button"
            className="section-toggle"
            onClick={() => toggle(section.id)}
            aria-expanded={!!open[section.id]}
            aria-controls={`section-${section.id}`}
          >
            <span className="section-title">{section.title}</span>
            <Chevron />
          </button>
          <div className="section-body" id={`section-${section.id}`}>
            {section.id === 'brand' && <BrandPicker />}
            {section.id === 'typography' && <FontPicker />}
            {section.id === 'layout' && <LayoutPicker />}
            {section.id === 'details' && (
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
            {section.id === 'contact' && (
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
            {section.id === 'socials' && <SocialRows />}
            {section.id === 'media' && (
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
        </section>
      ))}
    </div>
  );
}
