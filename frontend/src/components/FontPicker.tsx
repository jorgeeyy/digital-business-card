import { useEffect } from 'react';
import { useConfig } from '../store';
import { fonts, fontCategories } from '../data/fonts';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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
      <Select value={config.font} onValueChange={(value) => updateConfig({ font: value })}>
        <SelectTrigger className="font-select-trigger" aria-label="Typography">
          <SelectValue placeholder="Choose a font" />
        </SelectTrigger>
        <SelectContent>
          {hasCustom && <SelectItem value={config.font}>Custom font</SelectItem>}
          {fontCategories.map((cat) => {
            const items = fonts.filter((f) => f.category === cat);
            if (!items.length) return null;
            return (
              <SelectGroup key={cat}>
                <SelectLabel>{cat}</SelectLabel>
                {items.map((f) => (
                  <SelectItem key={f.id} value={f.value}>
                    <span style={f.style}>{f.label}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
