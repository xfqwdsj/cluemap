'use client';

import { ForceParams } from '@/lib/graph-utils';
import { useStore } from '@/lib/store';
import { LocaleMessages } from '@/lib/i18n';

interface ForceControlPanelProps {
  params: ForceParams;
  onChange: (key: keyof ForceParams, value: number) => void;
  onReset: () => void;
  onClose: () => void;
}

const PARAM_CONFIG: { key: keyof ForceParams; labelKey: keyof LocaleMessages; min: number; max: number; step: number }[] = [
  { key: 'linkDistance', labelKey: 'linkDistance', min: 30, max: 400, step: 10 },
  { key: 'chargeStrength', labelKey: 'chargeStrength', min: -2000, max: 0, step: 50 },
  { key: 'collisionRadius', labelKey: 'collisionRadius', min: 10, max: 200, step: 5 },
  { key: 'dragAlphaTarget', labelKey: 'dragAlphaTarget', min: 0, max: 1, step: 0.05 },
  { key: 'nodeRadius', labelKey: 'nodeRadius', min: 4, max: 40, step: 1 },
  { key: 'alphaDecay', labelKey: 'alphaDecay', min: 0.001, max: 0.1, step: 0.002 },
];

export function ForceControlPanel({ params, onChange, onReset, onClose }: ForceControlPanelProps) {
  const t = useStore((s) => s.getLocaleMessages());

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-72 rounded-lg shadow-lg"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {t.forceParams}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="text-xs px-2 py-0.5 rounded"
            style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}
          >
            {t.reset}
          </button>
          <button
            onClick={onClose}
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}
          >
            ×
          </button>
        </div>
      </div>
      <div className="px-3 py-2 space-y-2">
        {PARAM_CONFIG.map(({ key, labelKey, min, max, step }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>{t[labelKey]}</label>
              <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                {params[key]}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={params[key]}
              onChange={(e) => onChange(key, Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
