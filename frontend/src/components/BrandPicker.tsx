import { useConfig } from '../store';
import type { BrandColors } from '../types';

const colorFields: [keyof BrandColors, string][] = [
  ['primary', 'Background'],
  ['secondary', 'Surface'],
  ['secondary2', 'Surface 2'],
  ['accent', 'Accent'],
  ['accentDeep', 'Accent deep'],
  ['text', 'Text'],
  ['textDim', 'Muted'],
  ['cardBg', 'Card BG'],
];

export default function BrandPicker() {
  const { config, updateColors } = useConfig();
  const { colors } = config;

  return (
    <div className="color-row">
      {colorFields.map(([key, label]) => (
        <div className="color-field" key={key}>
          <input
            type="color"
            value={colors[key]}
            aria-label={label}
            onChange={(e) => updateColors({ [key]: e.target.value })}
          />
          <label>{label}</label>
          <span className="hex">{colors[key]}</span>
        </div>
      ))}
    </div>
  );
}
