import { useEffect } from 'react';
import { useConfig } from '../store';
import { fonts, fontCategories } from '../data/palettes';

function ensureFontLoaded(google: string, id: string) {
  const linkId = `tap-font-${id}`;
  if (document.getElementById(linkId)) return;
  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${google}&display=swap`;
  document.head.appendChild(link);
}

export default function FontPicker() {
  const { config, updateConfig } = useConfig();

  const selected = fonts.find((f) => f.value === config.font);
  const hasCustom = Boolean(config.font && !selected);

  useEffect(() => {
    if (selected?.google) ensureFontLoaded(selected.google, selected.id);
  }, [selected]);

  return (
    <div className="font-select">
      <select
        aria-label="Typography"
        value={config.font}
        onChange={(e) => updateConfig({ font: e.target.value })}
      >
        {hasCustom && <option value={config.font}>Custom font</option>}
        {fontCategories.map((cat) => {
          const items = fonts.filter((f) => f.category === cat);
          if (!items.length) return null;
          return (
            <optgroup key={cat} label={cat}>
              {items.map((f) => (
                <option key={f.id} value={f.value} style={f.style}>
                  {f.label}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
      <div className="font-select-preview" style={selected?.style}>
        {selected ? 'The quick brown fox jumps over the lazy dog' : 'Custom font preview'}
      </div>
    </div>
  );
}
