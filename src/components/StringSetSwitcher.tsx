'use client';

import { useStore } from '@/lib/store';

export function StringSetSwitcher({ fullWidth }: { fullWidth?: boolean }) {
  const currentDataset = useStore((s) => s.getCurrentDataset());
  const currentStringSetIndex = useStore((s) => s.currentStringSetIndex);
  const setCurrentStringSetIndex = useStore((s) => s.setCurrentStringSetIndex);
  const t = useStore((s) => s.getLocaleMessages());

  if (!currentDataset || currentDataset.stringSets.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${fullWidth ? '' : ''}`}>
      <label className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{t.stringSet}:</label>
      <select
        value={currentStringSetIndex}
        onChange={(e) => setCurrentStringSetIndex(Number(e.target.value))}
        className={`px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 ${fullWidth ? 'flex-1 min-w-0' : ''}`}
        style={{
          border: '1px solid var(--border-secondary)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          '--tw-ring-color': 'var(--accent-ring)',
        } as React.CSSProperties}
      >
        {currentDataset.stringSets.map((ss, index) => (
          <option key={index} value={index}>
            {ss.name}
          </option>
        ))}
      </select>
    </div>
  );
}
