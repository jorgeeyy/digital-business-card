import { useConfig } from '../store';
import type { BrandColors } from '../types';
import { contrastRatio, isHexColor, mixHex, randomPalette } from '../utils/color';

const colorFields: [keyof BrandColors, string][] = [
  ['primary', 'Background'],
  ['accent', 'Accent'],
  ['text', 'Text'],
  ['cardBg', 'Card surface'],
];

export default function BrandPicker() {
  const { config, updateColors, resetColors } = useConfig();
  const { colors } = config;

  const valid =
    isHexColor(colors.primary) && isHexColor(colors.text) && isHexColor(colors.cardBg);
  const ratio = valid
    ? contrastRatio(colors.text, mixHex(colors.cardBg, colors.primary, 0.7))
    : 0;
  const lowContrast = valid && ratio < 4.5;

  return (
    <>
      <div className="brand-actions">
        <button
          type="button"
          className="btn btn-small btn-ghost"
          onClick={() => updateColors(randomPalette())}
        >
          Shuffle
        </button>
        <button type="button" className="btn btn-small btn-ghost" onClick={resetColors}>
          Reset
        </button>
      </div>
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
      {lowContrast && (
        <div className="contrast-hint" role="status">
          Low contrast — text reads at {ratio.toFixed(1)}:1 on the card (aim for 4.5:1)
        </div>
      )}
    </>
  );
}
