'use client';

import { useStore } from '@/lib/store';

export function StringSetSwitcher() {
  const currentDataset = useStore((s) => s.getCurrentDataset());
  const currentStringSetIndex = useStore((s) => s.currentStringSetIndex);
  const setCurrentStringSetIndex = useStore((s) => s.setCurrentStringSetIndex);
  const t = useStore((s) => s.getLocaleMessages());

  if (!currentDataset || currentDataset.stringSets.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-500">{t.stringSet}:</label>
      <select
        value={currentStringSetIndex}
        onChange={(e) => setCurrentStringSetIndex(Number(e.target.value))}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
