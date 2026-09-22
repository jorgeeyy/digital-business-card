import { useConfig } from '../store';
import type { Layout } from '../types';

const layouts: { id: Layout; icon: string; name: string }[] = [
  { id: 'classic', icon: '📐', name: 'Classic' },
  { id: 'compact', icon: '📱', name: 'Compact' },
  { id: 'bold', icon: '🔥', name: 'Bold' },
];

export default function LayoutPicker() {
  const { config, updateConfig } = useConfig();

  return (
    <div className="layout-options">
      {layouts.map((l) => (
        <button
          key={l.id}
          className={`layout-option${config.layout === l.id ? ' active' : ''}`}
          onClick={() => updateConfig({ layout: l.id })}
        >
          <div className="layout-icon">{l.icon}</div>
          <div className="lname">{l.name}</div>
        </button>
      ))}
    </div>
  );
}
