'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Connection } from '@/types';
import { TreeNode, buildTree } from '@/lib/tree-builder';
import { MathText } from './MathText';
import { RelationshipBadge } from './RelationshipBadge';
import { CompoundConditionCard } from './CompoundConditionCard';

function TreeComponent({ node, connection, level = 0, highlightId }: { node: TreeNode; connection?: Connection; level?: number; highlightId?: string }) {
  const selectedStatementId = useStore((s) => s.selectedStatementId);
  const selectStatement = useStore((s) => s.selectStatement);
  const stringSet = useStore((s) => s.getCurrentStringSet());
  const isSelected = selectedStatementId === node.id;

  if (node.isVirtual && node.virtualNode) {
    const vn = node.virtualNode;

    return (
      <div className={`${level > 0 ? 'ml-6' : ''}`}>
        <CompoundConditionCard vn={vn} highlightId={node.parentId} />

        {node.connections.length > 0 && (
          <div className="border-l-2 border-gray-200 ml-4">
            {node.connections.map(({ node: child, connection: conn }) => (
              <div key={child.id} className="ml-2">
                <div className="py-1">
                  <RelationshipBadge type={conn.type} direction="forward" />
                </div>
                <TreeComponent node={child} connection={conn} level={level + 1} highlightId={highlightId} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${level > 0 ? 'ml-6' : ''}`}>
      <div
        onClick={() => selectStatement(node.id)}
        className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
          isSelected ? 'bg-blue-100 border border-blue-300' : ''
        }`}
      >
        <span className="text-gray-400">{'●'}</span>
        <span className="text-sm text-gray-900">
          <MathText text={stringSet?.[node.id] || node.id} />
        </span>
      </div>

      {node.connections.length > 0 && (
        <div className="border-l-2 border-gray-200 ml-4">
          {node.connections.map(({ node: child, connection: conn }) => {
            const direction = conn.from === node.id ? 'forward' : 'backward';
            return (
              <div key={child.id} className="ml-2">
                <div className="py-1">
                  <RelationshipBadge type={conn.type} direction={direction} />
                </div>
                <TreeComponent node={child} connection={conn} level={level + 1} highlightId={highlightId} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TreeView() {
  const currentDataset = useStore((s) => s.getCurrentDataset());
  const selectedStatementId = useStore((s) => s.selectedStatementId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { tree, maxDepth } = useMemo(() => {
    if (!currentDataset || !selectedStatementId) return { tree: null, maxDepth: 0 };
    return buildTree(currentDataset, selectedStatementId);
  }, [currentDataset, selectedStatementId]);

  const t = useStore((s) => s.getLocaleMessages());

  // Scroll to top when selected statement changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [selectedStatementId]);

  if (!currentDataset) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        {t.noDataset}
      </div>
    );
  }

  if (!selectedStatementId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        {t.selectStatement}
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        {t.noConnections}
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="p-4 overflow-auto h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t.derivationTree}
      </h3>
      <div style={{ minWidth: `${320 + maxDepth * 48}px` }}>
        <TreeComponent node={tree} highlightId={selectedStatementId} />
      </div>
    </div>
  );
}
