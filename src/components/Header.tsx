'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { StringSetSwitcher } from './StringSetSwitcher';
import { getAvailableLocales, setLocale as setI18nLocale, LocaleMessages } from '@/lib/i18n';
import { DropZone } from './ui/DropZone';
import { RecentFilesModal } from './RecentFilesModal';
import { getRecentFiles, addRecentFile, openFileFromHandle, fetchFileFromUrl } from '@/lib/file-history';
import type { FileHistoryEntry } from '@/lib/file-history';
import { ActionGroup, ActionItem } from './Actions';
import { ThemeToggle } from './ThemeToggle';
import { IconButton } from './ui/IconButton';

export function Header() {
  const currentDataset = useStore((s) => s.getCurrentDataset());
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);
  const t = useStore((s) => s.getLocaleMessages());
  const showLocaleUpload = useStore((s) => s.localeUploadOpen);
  const setShowLocaleUpload = useStore((s) => s.setLocaleUploadOpen);
  const [showRecent, setShowRecent] = useState(false);
  const [recentEntries, setRecentEntries] = useState<FileHistoryEntry[]>([]);
  const eggMode = useStore((s) => s.eggMode);
  const setEggMode = useStore((s) => s.setEggMode);
  const clickTimesRef = useRef<number[]>([]);

  const refreshRecent = useCallback(() => {
    getRecentFiles('locales').then(setRecentEntries);
  }, []);

  useEffect(() => {
    if (showLocaleUpload) {
      refreshRecent();
    }
  }, [showLocaleUpload, refreshRecent]);

  const handleLocaleUpload = useCallback(async (file: File, handle?: FileSystemFileHandle, sourceUrl?: string) => {
    try {
      const text = await file.text();
      const messages: LocaleMessages = JSON.parse(text);

      const requiredFields: (keyof LocaleMessages)[] = ['appName', 'graphView', 'treeView', 'detailView'];
      for (const field of requiredFields) {
        if (!(field in messages)) {
          alert(t.localeMissingField + field);
          return;
        }
      }

      if (handle) {
        await addRecentFile('locales', file.name, handle);
      } else if (sourceUrl) {
        await addRecentFile('locales', file.name, undefined, sourceUrl);
      }

      const localeName = messages.appName || file.name.replace('.json', '');
      setI18nLocale(localeName, messages);
      setLocale(localeName);
      setShowLocaleUpload(false);
    } catch {
      alert(t.localeInvalid);
    }
  }, [setLocale]);

  const handleRecentSelect = useCallback(async (entry: FileHistoryEntry) => {
    try {
      setShowRecent(false);
      let file: File;
      if (entry.url) {
        file = await fetchFileFromUrl(entry.url);
        await addRecentFile('locales', entry.name, undefined, entry.url);
      } else if (entry.handle) {
        file = await openFileFromHandle(entry.handle);
        await addRecentFile('locales', entry.name, entry.handle);
      } else {
        return;
      }
      await handleLocaleUpload(file);
    } catch {
      alert('无法访问文件');
    }
  }, [handleLocaleUpload]);

  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

  const handleTitleClick = useCallback(() => {
    const now = Date.now();
    const times = clickTimesRef.current.filter(t => now - t < 500);
    times.push(now);
    clickTimesRef.current = times;
    if (times.length >= 3) {
      clickTimesRef.current = [];
      setEggMode(!eggMode);
    }
  }, [eggMode, setEggMode]);

  return (
    <header style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }} className="px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <IconButton onClick={toggleSidebar} className="lg:hidden" aria-label={t.toggleSidebar}>
            {sidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </IconButton>
          <h1
            className="text-xl lg:text-2xl font-bold select-none"
            style={{ color: 'var(--text-primary)', cursor: 'default' }}
            onClick={handleTitleClick}
          >
            {t.appName}
            {eggMode && <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>🥚</span>}
          </h1>
          {currentDataset && (
            <span className="text-sm hidden sm:inline truncate max-w-40" style={{ color: 'var(--text-muted)' }}>
              {currentDataset.name}
            </span>
          )}
        </div>

        <ActionGroup>
          <ActionItem id="theme" priority={0}>
            <ThemeToggle />
          </ActionItem>
          <ActionItem id="stringset" priority={2}>
            <StringSetSwitcher />
          </ActionItem>
          <ActionItem id="locale" priority={1}>
            <div className="flex items-center gap-2">
              <label className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{t.language}:</label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{
                  border: '1px solid var(--border-secondary)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  '--tw-ring-color': 'var(--accent-ring)',
                } as React.CSSProperties}
              >
                {getAvailableLocales().map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'zh' ? t.chinese : loc}
                  </option>
                ))}
              </select>
              <IconButton onClick={() => setShowLocaleUpload(!showLocaleUpload)} title={t.uploadLanguagePack}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </IconButton>
            </div>
          </ActionItem>
        </ActionGroup>
      </div>

      {showLocaleUpload && (
        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t.uploadLanguagePack}</span>
            <IconButton onClick={() => setShowLocaleUpload(false)} aria-label="Close">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          </div>
          <DropZone
            onFile={handleLocaleUpload}
            hint={t.selectJsonLanguagePack}
            releaseText={t.dragRelease}
            browseText={t.browse}
            compact
            onOpenRecent={() => setShowRecent(true)}
            recentCount={recentEntries.length}
            urlLabel={t.urlInputLabel}
            urlPlaceholder={t.urlInputPlaceholder}
            urlLoadText={t.urlLoad}
            urlLoadingText={t.urlLoading}
            urlErrorInvalid={t.urlErrorInvalid}
            urlErrorNetwork={t.urlErrorNetwork}
            urlErrorFetch={t.urlErrorFetch}
            orText={t.orText}
          />
        </div>
      )}

      <RecentFilesModal
        isOpen={showRecent}
        onClose={() => setShowRecent(false)}
        type="locales"
        entries={recentEntries}
        onSelect={handleRecentSelect}
        onRefresh={refreshRecent}
      />
    </header>
  );
}
