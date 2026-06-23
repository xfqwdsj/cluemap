'use client';

import { useStore } from '@/lib/store';
import { Modal } from './ui/Modal';
import { IconButton } from './ui/IconButton';
import { FileHistoryEntry, removeRecentFile, FileHistoryType } from '@/lib/file-history';

interface RecentFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: FileHistoryType;
  entries: FileHistoryEntry[];
  onSelect: (entry: FileHistoryEntry) => void;
  onRefresh: () => void;
}

export function RecentFilesModal({ isOpen, onClose, type, entries, onSelect, onRefresh }: RecentFilesModalProps) {
  const t = useStore((s) => s.getLocaleMessages());

  const handleDelete = async (id: string) => {
    await removeRecentFile(type, id);
    onRefresh();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return t.today;
    if (days === 1) return t.yesterday;
    return `${days}${t.daysAgo}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.recentFiles}
    >
      {entries.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>{t.noRecentFiles}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {entries.map((entry) => (
            <li
              key={entry.id}
              onClick={() => onSelect(entry)}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors cursor-pointer"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{entry.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTime(entry.lastOpened)}</p>
              </div>
              <IconButton
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                title={t.deleteEntry}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
