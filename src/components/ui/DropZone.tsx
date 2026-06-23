'use client';

import { useState, useCallback } from 'react';
import { Button } from './Button';

interface DropZoneProps {
  onFile: (file: File, handle?: FileSystemFileHandle, sourceUrl?: string) => void;
  accept?: string;
  hint?: string;
  releaseText?: string;
  browseText?: string;
  formatHint?: string;
  compact?: boolean;
  onOpenRecent?: () => void;
  recentCount?: number;
  urlLabel?: string;
  urlPlaceholder?: string;
  urlLoadText?: string;
  urlLoadingText?: string;
  urlErrorInvalid?: string;
  urlErrorNetwork?: string;
  urlErrorFetch?: string;
  orText?: string;
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
  urlLabel,
  urlPlaceholder,
  urlLoadText,
  urlLoadingText,
  urlErrorInvalid,
  urlErrorNetwork,
  urlErrorFetch,
  orText,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

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

  const handleUrlLoad = useCallback(async () => {
    const trimmed = urlValue.trim();
    if (!trimmed) {
      setUrlError(urlErrorInvalid || '请输入有效的 URL');
      return;
    }
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      setUrlError(urlErrorInvalid || '请输入有效的 URL');
      return;
    }
    setUrlLoading(true);
    setUrlError(null);
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const fileName = url.pathname.split('/').pop() || 'remote-file.json';
      const file = new File([blob], fileName, { type: blob.type || 'application/json' });
      onFile(file, undefined, url.toString());
    } catch (e) {
      if (e instanceof TypeError) {
        setUrlError(urlErrorNetwork || '网络错误，请检查连接');
      } else {
        setUrlError(urlErrorFetch || '加载失败');
      }
    } finally {
      setUrlLoading(false);
    }
  }, [urlValue, onFile, urlErrorInvalid, urlErrorNetwork, urlErrorFetch]);

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

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{orText || '或'}</span>
        <div className="flex-1 flex items-center gap-1.5">
          <input
            type="url"
            value={urlValue}
            onChange={(e) => { setUrlValue(e.target.value); setUrlError(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleUrlLoad(); }}
            placeholder={urlPlaceholder || 'https://example.com/data.json'}
            disabled={urlLoading}
            className="flex-1 px-2.5 h-10 text-sm rounded-md border focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{
              border: '1px solid var(--border-secondary)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              '--tw-ring-color': 'var(--accent-ring)',
            } as React.CSSProperties}
          />
          <Button
            size="sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUrlLoad(); }}
            disabled={urlLoading || !urlValue.trim()}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {urlLoading ? (urlLoadingText || '加载中...') : (urlLoadText || '加载')}
          </Button>
        </div>
      </div>

      {urlLoading && (
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-secondary)' }}>
          <div
            className="h-full rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--accent)', width: '60%' }}
          />
        </div>
      )}

      {urlError && (
        <p className="mt-2 text-xs" style={{ color: 'var(--error-text, #ef4444)' }}>{urlError}</p>
      )}

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
