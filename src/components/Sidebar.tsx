'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { SearchBar } from './SearchBar';
import { MathText } from './MathText';
import { StringSetSwitcher } from './StringSetSwitcher';
import { getAvailableLocales } from '@/lib/i18n';
import { IconButton } from './ui/IconButton';
import { useTheme } from 'next-themes';

export function Sidebar() {
  const currentDataset = useStore((s) => s.getCurrentDataset());
  const selectedStatementId = useStore((s) => s.selectedStatementId);
  const selectStatement = useStore((s) => s.selectStatement);
  const searchQuery = useStore((s) => s.searchQuery);
  const stringSet = useStore((s) => s.getCurrentStringSet());
  const selectedCategory = useStore((s) => s.selectedCategory);
  const setSelectedCategory = useStore((s) => s.setSelectedCategory);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);
  const collapsedActionIds = useStore((s) => s.collapsedActionIds);
  const setShowLocaleUpload = useStore((s) => s.setLocaleUploadOpen);
  const t = useStore((s) => s.getLocaleMessages());
  const { theme, setTheme } = useTheme();

  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);

  const filteredStatements = useMemo(() => {
    if (!currentDataset) return [];

    return currentDataset.statements.filter((stmt) => {
      if (selectedCategory && stmt.category !== selectedCategory) {
        return false;
      }
      if (searchQuery) {
        const text = stringSet?.[stmt.id] || stmt.id;
        return text.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [currentDataset, searchQuery, stringSet, selectedCategory]);

  useEffect(() => {
    if (!selectedStatementId) return;
    const element = itemRefs.current.get(selectedStatementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedStatementId]);

  const categories = currentDataset?.categories || [];

  const handleSelect = (id: string) => {
    selectStatement(id);
    setSidebarOpen(false);
  };

  return (
    <div
      className={`
        lg:relative lg:translate-x-0 lg:w-80
        fixed inset-y-0 left-0 z-40 w-80
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-4 lg:hidden" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t.appName}</span>
        <IconButton onClick={() => setSidebarOpen(false)} aria-label={t.closeSidebar}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
      </div>
      <SearchBar />

      {categories.length > 0 && (
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{
              border: '1px solid var(--border-secondary)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              '--tw-ring-color': 'var(--accent-ring)',
            } as React.CSSProperties}
          >
            <option value="">{t.allCategories}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex-1 overflow-y-auto" ref={listRef}>
        {filteredStatements.length === 0 ? (
          <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
            {currentDataset ? t.noStatements : t.noDataset}
          </div>
        ) : (
          <ul>
            {filteredStatements.map((stmt) => {
              const category = categories.find((c) => c.id === stmt.category);
              const isSelected = selectedStatementId === stmt.id;
              return (
                <li
                  key={stmt.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(stmt.id, el);
                    else itemRefs.current.delete(stmt.id);
                  }}
                  onClick={() => handleSelect(stmt.id)}
                  className="px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border-primary)',
                    backgroundColor: isSelected ? 'var(--bg-active)' : undefined,
                    borderLeft: isSelected ? '4px solid var(--accent)' : '4px solid transparent',
                  }}
                >
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    <MathText text={stringSet?.[stmt.id] || stmt.id} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {category && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                        {category.name}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {collapsedActionIds.length > 0 && (
        <div className="px-4 py-3 space-y-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
          {collapsedActionIds.includes('theme') && (
            <button
              onClick={() => {
                const order: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
                const current = (theme || 'system') as 'system' | 'light' | 'dark';
                const next = order[(order.indexOf(current) + 1) % order.length];
                setTheme(next);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {theme === 'dark' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                ) : theme === 'light' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                )}
              </svg>
              <span>{theme === 'dark' ? t.darkMode : theme === 'light' ? t.lightMode : t.followSystem}</span>
            </button>
          )}
          {collapsedActionIds.includes('stringset') && (
            <StringSetSwitcher fullWidth />
          )}
          {collapsedActionIds.includes('locale') && (
            <div className="flex items-center gap-2">
              <label className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{t.language}:</label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
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
              <IconButton onClick={() => setShowLocaleUpload(true)} className="flex-shrink-0" title={t.uploadLanguagePack}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </IconButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
