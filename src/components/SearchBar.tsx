'use client';

import { useStore } from '@/lib/store';
import { Input } from './ui/Input';

export function SearchBar() {
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const t = useStore((s) => s.getLocaleMessages());

  return (
    <div className="p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
      <Input
        type="text"
        placeholder={t.searchPlaceholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
