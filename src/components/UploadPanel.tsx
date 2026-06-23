'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { parseDataSet, parseStringSet } from '@/lib/parser';
import { getRecentFiles, addRecentFile, openFileFromHandle } from '@/lib/file-history';
import type { FileHistoryType, FileHistoryEntry } from '@/lib/file-history';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { DropZone } from './ui/DropZone';
import { RecentFilesModal } from './RecentFilesModal';

type UploadMode = 'dataset' | 'stringset';

export function UploadPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<UploadMode>('dataset');
  const [error, setError] = useState<string | null>(null);
  const addDataset = useStore((s) => s.addDataset);
  const setCurrentDataset = useStore((s) => s.setCurrentDataset);
  const addStringSetToCurrentDataset = useStore((s) => s.addStringSetToCurrentDataset);
  const currentDatasetId = useStore((s) => s.currentDatasetId);
  const t = useStore((s) => s.getLocaleMessages());

  const [showRecent, setShowRecent] = useState(false);
  const [recentEntries, setRecentEntries] = useState<FileHistoryEntry[]>([]);
  const historyType: FileHistoryType = mode === 'dataset' ? 'datasets' : 'stringsets';

  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const refreshRecent = useCallback(() => {
    getRecentFiles(historyType).then(setRecentEntries);
  }, [historyType]);

  useEffect(() => {
    if (isOpen) {
      refreshRecent();
    }
  }, [isOpen, refreshRecent]);

  const handleDatasetUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      const text = await file.text();
      const dataset = parseDataSet(text);
      addDataset(dataset);
      setCurrentDataset(dataset.id);
      setIsOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.parseError);
    }
  }, [addDataset, setCurrentDataset]);

  const handleStringSetUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      if (!currentDatasetId) {
        setError(t.selectDatasetFirst);
        return;
      }
      const text = await file.text();
      const stringSet = parseStringSet(text);
      addStringSetToCurrentDataset(stringSet);
      setIsOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.parseError);
    }
  }, [currentDatasetId, addStringSetToCurrentDataset]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (mode === 'dataset') {
      await handleDatasetUpload(file);
    } else {
      await handleStringSetUpload(file);
    }
  }, [mode, handleDatasetUpload, handleStringSetUpload]);

  const handleDrop = useCallback(async (file: File, handle?: FileSystemFileHandle) => {
    if (!file.name.endsWith('.json')) {
      setError(t.jsonFilesOnly);
      return;
    }
    if (handle) {
      await addRecentFile(historyType, file.name, handle);
    }
    await handleFileUpload(file);
  }, [handleFileUpload, historyType]);

  const handleRecentSelect = useCallback(async (entry: FileHistoryEntry) => {
    try {
      setShowRecent(false);
      const file = await openFileFromHandle(entry.handle);
      await addRecentFile(historyType, entry.name, entry.handle);
      await handleFileUpload(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.fileAccessError);
    }
  }, [handleFileUpload, historyType]);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button onClick={() => { setMode('dataset'); setIsOpen(true); }}>
          {t.uploadDataset}
        </Button>
        {currentDatasetId && (
          <Button
            variant="secondary"
            onClick={() => { setMode('stringset'); setIsOpen(true); }}
          >
            {t.uploadStringSet}
          </Button>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={mode === 'dataset' ? t.uploadDataset : t.uploadStringSet}
      >
        <DropZone
          onFile={handleDrop}
          hint={t.dragDropHint}
          releaseText={t.dragRelease}
          browseText={t.browse}
          formatHint={t.jsonOnly}
          onOpenRecent={() => setShowRecent(true)}
          recentCount={recentEntries.length}
        />

        {error && (
          <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}>
            {error}
          </div>
        )}
      </Modal>

      <RecentFilesModal
        isOpen={showRecent}
        onClose={() => setShowRecent(false)}
        type={historyType}
        entries={recentEntries}
        onSelect={handleRecentSelect}
        onRefresh={refreshRecent}
      />
    </>
  );
}
