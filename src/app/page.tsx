'use client';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { GraphView } from '@/components/GraphView';
import { TreeView } from '@/components/TreeView';
import { DetailView } from '@/components/DetailView';
import { Tabs } from '@/components/ui/Tabs';
import { UploadPanel } from '@/components/UploadPanel';
import { ValidatorPanel } from '@/components/ValidatorPanel';
import { useStore } from '@/lib/store';
import { useAutoLoadRecent } from '@/hooks/useAutoLoadRecent';

export default function Home() {
  useAutoLoadRecent();
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const t = useStore((s) => s.getLocaleMessages());

  const tabs = [
    { id: 'graph', label: t.graphView },
    { id: 'tree', label: t.treeView },
    { id: 'detail', label: t.detailView }
  ];

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ backgroundColor: 'var(--bg-overlay)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="p-4 flex items-center justify-between gap-2 flex-wrap" style={{ borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as 'graph' | 'tree' | 'detail')} />
            <UploadPanel />
          </div>

          <div className="flex-1 overflow-hidden relative">
            <GraphView isVisible={activeTab === 'graph'} />
            {activeTab === 'tree' && <TreeView />}
            {activeTab === 'detail' && <DetailView />}
          </div>

          <ValidatorPanel />
        </div>
      </div>
    </div>
  );
}
