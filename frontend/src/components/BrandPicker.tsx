import { useConfig } from '../store';
import { palettes } from '../data/palettes';

export default function BrandPicker() {
  const { config, setPalette, updateColors } = useConfig();
  const { paletteId, colors } = config;

  return (
    <>
      <div className="palette-grid" role="radiogroup" aria-label="Color palettes">
        {palettes.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={paletteId === p.id}
            className={`palette-swatch${paletteId === p.id ? ' active' : ''}`}
            onClick={() => setPalette(p)}
          >
            <div className="colors">
              <div className="dot" style={{ background: p.colors.accent }} />
              <div className="dot" style={{ background: p.colors.secondary }} />
              <div className="dot" style={{ background: p.colors.cardBg }} />
            </div>
            <div className="label">{p.name}</div>
          </button>
        ))}
      </div>
      <div className="color-row">
        {([
          ['primary', 'Background'],
          ['secondary', 'Surface'],
          ['accent', 'Accent'],
          ['text', 'Text'],
          ['textDim', 'Muted'],
          ['cardBg', 'Card BG'],
        ] as [keyof typeof colors, string][]).map(([key, label]) => (
          <div className="color-field" key={key}>
            <input
              type="color"
              value={colors[key]}
              aria-label={label}
              onChange={(e) => updateColors({ [key]: e.target.value })}
            />
            <label>{label}</label>
          </div>
        ))}
      </div>
    </>
  );
}
