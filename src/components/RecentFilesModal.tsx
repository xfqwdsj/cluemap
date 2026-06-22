'use client';

import { useStore } from '@/lib/store';
import { Modal } from './ui/Modal';
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
        <p className="text-sm text-gray-500 text-center py-4">{t.noRecentFiles}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg">
              <button
                onClick={() => onSelect(entry)}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-sm font-medium text-gray-900 truncate">{entry.name}</p>
                <p className="text-xs text-gray-500">{formatTime(entry.lastOpened)}</p>
              </button>
              <button
                onClick={() => handleDelete(entry.id)}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                title={t.deleteEntry}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
