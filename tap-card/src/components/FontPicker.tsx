import { useConfig } from '../store';
import { fonts } from '../data/palettes';

export default function FontPicker() {
  const { config, updateConfig } = useConfig();

  return (
    <div className="font-options">
      {fonts.map((f) => (
        <button
          key={f.id}
          className={`font-option${config.font === f.value ? ' active' : ''}`}
          style={f.style}
          onClick={() => updateConfig({ font: f.value })}
        >
          <div>{f.preview}</div>
          <div className="fname">{f.label}</div>
        </button>
      ))}
    </div>
  );
}
