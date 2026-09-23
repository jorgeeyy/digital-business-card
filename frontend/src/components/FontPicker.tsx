import { useConfig } from '../store';
import { fonts } from '../data/palettes';

export default function FontPicker() {
  const { config, updateConfig } = useConfig();

  return (
    <div className="font-options" role="radiogroup" aria-label="Fonts">
      {fonts.map((f) => (
        <button
          key={f.id}
          type="button"
          role="radio"
          aria-checked={config.font === f.value}
          className={`font-option${config.font === f.value ? ' active' : ''}`}
          onClick={() => updateConfig({ font: f.value })}
        >
          <span className="preview" style={f.style}>
            {f.preview}
          </span>
          <span className="name">{f.label}</span>
        </button>
      ))}
    </div>
  );
}
