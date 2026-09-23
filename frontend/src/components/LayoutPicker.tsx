import { useConfig } from '../store';
import type { Layout } from '../types';

const layouts: { id: Layout; name: string }[] = [
  { id: 'classic', name: 'Classic' },
  { id: 'compact', name: 'Compact' },
  { id: 'bold', name: 'Bold' },
];

const card = '#ffffff';
const line = 'rgba(26,20,4,0.12)';
const fill = 'rgba(26,20,4,0.06)';
const strong = 'rgba(26,20,4,0.16)';

function LayoutPreview({ layout }: { layout: Layout }) {
  if (layout === 'classic') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 48, height: 64, borderRadius: 6, border: `1px solid ${line}`, background: card, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 6, gap: 3 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: fill, border: `1px solid ${strong}` }} />
          <div style={{ width: 32, height: 3, borderRadius: 2, background: strong }} />
          <div style={{ width: 24, height: 2, borderRadius: 2, background: line }} />
          <div style={{ width: 36, height: 6, borderRadius: 3, background: '#FFD633', marginTop: 4 }} />
          <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
            <div style={{ width: 14, height: 10, borderRadius: 3, background: fill, border: `1px solid ${line}` }} />
            <div style={{ width: 14, height: 10, borderRadius: 3, background: fill, border: `1px solid ${line}` }} />
          </div>
        </div>
      </div>
    );
  }
  if (layout === 'compact') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 48, height: 64, borderRadius: 6, border: `1px solid ${line}`, background: card, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 6px', gap: 2 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: strong }} />
          <div style={{ width: 28, height: 2, borderRadius: 2, background: line }} />
          <div style={{ width: 36, height: 5, borderRadius: 2, background: '#FFD633', marginTop: 2 }} />
          <div style={{ width: 36, height: 8, borderRadius: 3, background: fill, border: `1px solid ${line}`, marginTop: 2 }} />
          <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
            <div style={{ width: 14, height: 8, borderRadius: 3, background: fill, border: `1px solid ${line}` }} />
            <div style={{ width: 14, height: 8, borderRadius: 3, background: fill, border: `1px solid ${line}` }} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 48, height: 64, borderRadius: 6, border: `1px solid ${line}`, background: card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', height: 28, background: fill }} />
        <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 32, height: 3, borderRadius: 2, background: strong }} />
          <div style={{ width: 36, height: 5, borderRadius: 2, background: '#FFD633' }} />
          <div style={{ width: 36, height: 8, borderRadius: 3, background: fill, border: `1px solid ${line}`, marginTop: 1 }} />
        </div>
      </div>
    </div>
  );
}

export default function LayoutPicker() {
  const { config, updateConfig } = useConfig();

  return (
    <div className="layout-options" role="radiogroup" aria-label="Layouts">
      {layouts.map((l) => (
        <button
          key={l.id}
          type="button"
          role="radio"
          aria-checked={config.layout === l.id}
          className={`layout-option${config.layout === l.id ? ' active' : ''}`}
          onClick={() => updateConfig({ layout: l.id })}
        >
          <LayoutPreview layout={l.id} />
          <div className="name">{l.name}</div>
        </button>
      ))}
    </div>
  );
}
