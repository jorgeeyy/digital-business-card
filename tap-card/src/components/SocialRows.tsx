import { useConfig } from '../store';
import { socialPlatforms } from '../types';

export default function SocialRows() {
  const { config, addSocial, updateSocial, removeSocial } = useConfig();
  const { socials } = config;

  return (
    <>
      <div className="social-rows">
        {socials.map((soc, i) => (
          <div className="social-row" key={i}>
            <select
              value={soc.platform}
              onChange={(e) => updateSocial(i, 'platform', e.target.value)}
            >
              {socialPlatforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Handle"
              value={soc.handle}
              onChange={(e) => updateSocial(i, 'handle', e.target.value)}
            />
            <input
              type="text"
              placeholder="https://..."
              value={soc.url}
              onChange={(e) => updateSocial(i, 'url', e.target.value)}
            />
            <button className="btn-remove" onClick={() => removeSocial(i)}>
              ×
            </button>
          </div>
        ))}
      </div>
      {socials.length < 6 && (
        <button className="btn-add" onClick={addSocial}>
          + Add social link
        </button>
      )}
    </>
  );
}
