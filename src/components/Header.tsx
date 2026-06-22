'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { StringSetSwitcher } from './StringSetSwitcher';
import { getAvailableLocales, setLocale as setI18nLocale, LocaleMessages } from '@/lib/i18n';
import { DropZone } from './ui/DropZone';
import { RecentFilesModal } from './RecentFilesModal';
import { getRecentFiles, addRecentFile, openFileFromHandle } from '@/lib/file-history';
import type { FileHistoryEntry } from '@/lib/file-history';
import { ActionGroup, ActionItem } from './Actions';

export function Header() {
  const currentDataset = useStore((s) => s.getCurrentDataset());
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);
  const t = useStore((s) => s.getLocaleMessages());
  const showLocaleUpload = useStore((s) => s.localeUploadOpen);
  const setShowLocaleUpload = useStore((s) => s.setLocaleUploadOpen);
  const [showRecent, setShowRecent] = useState(false);
  const [recentEntries, setRecentEntries] = useState<FileHistoryEntry[]>([]);

  const refreshRecent = useCallback(() => {
    getRecentFiles('locales').then(setRecentEntries);
  }, []);

  useEffect(() => {
    if (showLocaleUpload) {
      refreshRecent();
    }
  }, [showLocaleUpload, refreshRecent]);

  const handleLocaleUpload = useCallback(async (file: File, handle?: FileSystemFileHandle) => {
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
      const file = await openFileFromHandle(entry.handle);
      await addRecentFile('locales', entry.name, entry.handle);
      await handleLocaleUpload(file);
    } catch {
      alert('无法访问文件');
    }
  }, [handleLocaleUpload]);

  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t.toggleSidebar}
          >
            {sidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t.appName}</h1>
          {currentDataset && (
            <span className="text-sm text-gray-500 hidden sm:inline truncate max-w-40">
              {currentDataset.name}
            </span>
          )}
        </div>

        <ActionGroup>
          <ActionItem id="stringset" priority={2}>
            <StringSetSwitcher />
          </ActionItem>
          <ActionItem id="locale" priority={1}>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">{t.language}:</label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getAvailableLocales().map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'zh' ? t.chinese : loc}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowLocaleUpload(!showLocaleUpload)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={t.uploadLanguagePack}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </ActionItem>
        </ActionGroup>
      </div>

      {showLocaleUpload && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t.uploadLanguagePack}</span>
            <button
              onClick={() => setShowLocaleUpload(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <DropZone
            onFile={handleLocaleUpload}
            hint={t.selectJsonLanguagePack}
            releaseText={t.dragRelease}
            browseText={t.browse}
            compact
            onOpenRecent={() => setShowRecent(true)}
            recentCount={recentEntries.length}
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
