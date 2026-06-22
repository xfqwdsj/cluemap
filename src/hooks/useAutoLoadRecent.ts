'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getLastOpenedFile, openFileFromHandle, addRecentFile } from '@/lib/file-history';
import { parseDataSet } from '@/lib/parser';

export function useAutoLoadRecent() {
  const addDataset = useStore((s) => s.addDataset);
  const setCurrentDataset = useStore((s) => s.setCurrentDataset);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const loadLastFile = async () => {
      const lastEntry = await getLastOpenedFile('datasets');
      if (!lastEntry) return;

      try {
        const file = await openFileFromHandle(lastEntry.handle);
        const text = await file.text();
        const dataset = parseDataSet(text);
        addDataset(dataset);
        setCurrentDataset(dataset.id);
        await addRecentFile('datasets', lastEntry.name, lastEntry.handle);
      } catch {
        // File handle expired or permission denied — silently ignore
      }
    };

    loadLastFile();
  }, []);
}
