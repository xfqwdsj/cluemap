'use client';

import { useState, useCallback } from 'react';

interface DropZoneProps {
  onFile: (file: File, handle?: FileSystemFileHandle) => void;
  accept?: string;
  hint?: string;
  releaseText?: string;
  browseText?: string;
  formatHint?: string;
  compact?: boolean;
  onOpenRecent?: () => void;
  recentCount?: number;
}

export function DropZone({
  onFile,
  accept = '.json',
  hint,
  releaseText,
  browseText,
  formatHint,
  compact = false,
  onOpenRecent,
  recentCount = 0,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;

    let handle: FileSystemFileHandle | undefined;
    if ('getAsFileSystemHandle' in DataTransferItem.prototype) {
      const item = e.dataTransfer.items[0];
      try {
        const h = await (item as any).getAsFileSystemHandle();
        if (h && h.kind === 'file') handle = h as FileSystemFileHandle;
      } catch {
        // handle not available
      }
    }
    onFile(file, handle);
  }, [onFile]);

  const handleBrowse = useCallback(async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ accept: { 'application/json': ['.json'] } }],
        });
        const file = await handle.getFile();
        onFile(file, handle as FileSystemFileHandle);
      } catch {
        // user cancelled
      }
    } else {
      document.getElementById(`file-input-${compact ? 'compact' : 'full'}`)?.click();
    }
  }, [onFile, compact]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-lg text-center transition-all duration-300 cursor-pointer ${
        compact ? 'p-4' : 'p-8'
      }`}
      style={{
        borderColor: isDragOver ? 'var(--accent)' : 'var(--border-secondary)',
        backgroundColor: isDragOver ? 'var(--accent-muted)' : 'transparent',
        transform: isDragOver ? 'scale(1.01)' : undefined,
      }}
    >
      {!compact && (
        <svg
          className="mx-auto h-12 w-12 transition-colors duration-300"
          style={{ color: isDragOver ? 'var(--accent)' : 'var(--text-placeholder)' }}
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <div className="block cursor-pointer" onClick={handleBrowse}>
        <input
          id={`file-input-${compact ? 'compact' : 'full'}`}
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
        <p
          className={`text-sm transition-colors duration-300 ${compact ? '' : 'mt-2'}`}
          style={{ color: isDragOver ? 'var(--accent-text)' : 'var(--text-secondary)' }}
        >
          {isDragOver ? releaseText : hint}{' '}
          <span style={{ color: 'var(--accent)' }}>{browseText}</span>
        </p>
        {formatHint && (
          <p
            className={`mt-1 text-xs transition-colors duration-300`}
            style={{ color: isDragOver ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {formatHint}
          </p>
        )}
      </div>

      {onOpenRecent && recentCount > 0 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenRecent();
          }}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer hover:bg-[var(--accent-muted)]"
          style={{ color: 'var(--accent)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {recentCount}
        </button>
      )}
    </div>
  );
}
