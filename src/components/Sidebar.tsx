'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { SearchBar } from './SearchBar';
import { MathText } from './MathText';

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
  const t = useStore((s) => s.getLocaleMessages());

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

  // Scroll to selected statement
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
    <div className={`
      lg:relative lg:translate-x-0 lg:w-80
      fixed inset-y-0 left-0 z-40 w-80
      bg-white border-r border-gray-200
      flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 lg:hidden">
        <span className="text-sm font-medium text-gray-700">{t.appName}</span>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={t.closeSidebar}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <SearchBar />

      {categories.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="p-4 text-center text-gray-500">
            {currentDataset ? t.noStatements : t.noDataset}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredStatements.map((stmt) => {
              const category = categories.find((c) => c.id === stmt.category);
              return (
                <li
                  key={stmt.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(stmt.id, el);
                    else itemRefs.current.delete(stmt.id);
                  }}
                  onClick={() => handleSelect(stmt.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedStatementId === stmt.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">
                    <MathText text={stringSet?.[stmt.id] || stmt.id} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {category && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
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
    </div>
  );
}
