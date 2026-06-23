'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getLastOpenedFile, openFileFromHandle, addRecentFile, fetchFileFromUrl } from '@/lib/file-history';
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
        let file: File;
        if (lastEntry.url) {
          file = await fetchFileFromUrl(lastEntry.url);
          await addRecentFile('datasets', lastEntry.name, undefined, lastEntry.url);
        } else if (lastEntry.handle) {
          file = await openFileFromHandle(lastEntry.handle);
          await addRecentFile('datasets', lastEntry.name, lastEntry.handle);
        } else {
          return;
        }
        const text = await file.text();
        const dataset = parseDataSet(text);
        addDataset(dataset);
        setCurrentDataset(dataset.id);
      } catch {
        // File handle expired or permission denied — silently ignore
      }
    };

    loadLastFile();
  }, []);
}
