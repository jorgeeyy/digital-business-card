import { useConfig } from '../store';
import BrandPicker from './BrandPicker';
import FontPicker from './FontPicker';
import LayoutPicker from './LayoutPicker';
import SocialRows from './SocialRows';
import UploadZone from './UploadZone';

interface ConfiguratorProps {
  onDownload: () => void;
  hasPreview: boolean;
}

export default function Configurator({ onDownload, hasPreview }: ConfiguratorProps) {
  const { config, updateConfig, setPortrait, setQr } = useConfig();

  return (
    <div className="form-panel">
      <h1>
        Tap Card <span>Configurator</span>
      </h1>

      <div className="section">
        <div className="section-title">Brand</div>
        <BrandPicker />
      </div>

      <div className="section">
        <div className="section-title">Typography</div>
        <FontPicker />
      </div>

      <div className="section">
        <div className="section-title">Layout</div>
        <LayoutPicker />
      </div>

      <div className="section">
        <div className="section-title">Details</div>
        <div className="field">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={config.name}
            onChange={(e) => updateConfig({ name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Role / Title</label>
          <input
            type="text"
            placeholder="Founder & CEO"
            value={config.role}
            onChange={(e) => updateConfig({ role: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Location</label>
          <input
            type="text"
            placeholder="New York, US"
            value={config.location}
            onChange={(e) => updateConfig({ location: e.target.value })}
          />
        </div>
      </div>

      <div className="section">
        <div className="section-title">Contact</div>
        <div className="field">
          <label>Phone</label>
          <input
            type="tel"
            placeholder="+1 234 567 8900"
            value={config.phone}
            onChange={(e) => updateConfig({ phone: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="john@example.com"
            value={config.email}
            onChange={(e) => updateConfig({ email: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Website</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={config.website}
            onChange={(e) => updateConfig({ website: e.target.value })}
          />
        </div>
      </div>

      <div className="section">
        <div className="section-title">Social Links</div>
        <SocialRows />
      </div>

      <div className="section">
        <div className="section-title">Media</div>
        <div className="upload-row">
          <UploadZone
            label="Portrait"
            accept="image/*,video/mp4,video/webm,video/mov"
            file={config.portrait?.dataUrl || null}
            onFile={(dataUrl) => {
              if (!dataUrl) {
                setPortrait(null);
              } else {
                const isVideo = dataUrl.startsWith('data:video');
                setPortrait({ type: isVideo ? 'video' : 'image', dataUrl });
              }
            }}
            isPortrait
          />
          <UploadZone
            label="QR Code"
            accept="image/*"
            file={config.qr || null}
            onFile={setQr}
          />
        </div>
      </div>

      <div className="actions-bar">
        <button className="btn-generate" onClick={onDownload} disabled={!hasPreview}>
          {hasPreview ? 'Download Card' : 'Generating...'}
        </button>
      </div>
    </div>
  );
}
