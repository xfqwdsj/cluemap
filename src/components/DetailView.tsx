'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { MathText } from './MathText';
import { RelationshipBadge } from './RelationshipBadge';
import { CompoundConditionCard } from './CompoundConditionCard';
import { Connection } from '@/types';

interface GroupedConnections {
  type: Connection['type'];
  connections: Connection[];
  direction: 'outgoing' | 'incoming';
}

export function DetailView() {
  const currentDataset = useStore((s) => s.getCurrentDataset());
  const selectedStatementId = useStore((s) => s.selectedStatementId);
  const stringSet = useStore((s) => s.getCurrentStringSet());
  const selectStatement = useStore((s) => s.selectStatement);
  const t = useStore((s) => s.getLocaleMessages());

  const RELATIONSHIP_LABELS: Record<string, string> = {
    implies: t.impliesLabel,
    inverse: t.inverseLabel,
    equivalent: t.equivalentLabel,
    subset: t.subsetLabel,
  };

  const groupedConnections = useMemo(() => {
    if (!currentDataset || !selectedStatementId) return { outgoing: [], incoming: [], compoundOutgoing: [], compoundIncoming: [] };

    const outgoing = currentDataset.connections.filter(
      (c) => c.from === selectedStatementId
    );
    const incoming = currentDataset.connections.filter(
      (c) => c.to === selectedStatementId
    );

    // Group outgoing by type
    const outgoingGrouped: GroupedConnections[] = [];
    const outgoingByType = outgoing.reduce((acc, conn) => {
      if (!acc[conn.type]) acc[conn.type] = [];
      acc[conn.type].push(conn);
      return acc;
    }, {} as Record<string, Connection[]>);

    for (const [type, connections] of Object.entries(outgoingByType)) {
      outgoingGrouped.push({ type: type as Connection['type'], connections, direction: 'outgoing' });
    }

    // Group incoming by type
    const incomingGrouped: GroupedConnections[] = [];
    const incomingByType = incoming.reduce((acc, conn) => {
      if (!acc[conn.type]) acc[conn.type] = [];
      acc[conn.type].push(conn);
      return acc;
    }, {} as Record<string, Connection[]>);

    for (const [type, connections] of Object.entries(incomingByType)) {
      incomingGrouped.push({ type: type as Connection['type'], connections, direction: 'incoming' });
    }

    // Find compound relationships involving this statement
    const virtualNodes = currentDataset.virtualNodes || [];

    // Compound outgoing: this statement is a premise in a virtual node
    const compoundOutgoing = virtualNodes.filter(vn =>
      vn.premises.includes(selectedStatementId)
    );

    // Compound incoming: this statement is the target of a virtual node
    const compoundIncoming = virtualNodes.filter(vn =>
      vn.target === selectedStatementId
    );

    return { outgoing: outgoingGrouped, incoming: incomingGrouped, compoundOutgoing, compoundIncoming };
  }, [currentDataset, selectedStatementId]);

  if (!currentDataset || !selectedStatementId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        {t.selectStatement}
      </div>
    );
  }

  const text = stringSet?.[selectedStatementId] || selectedStatementId;
  const categories = currentDataset.categories || [];
  const statement = currentDataset.statements.find((s) => s.id === selectedStatementId);
  const category = categories.find((c) => c.id === statement?.category);

  const hasConnections = groupedConnections.outgoing.length > 0 ||
    groupedConnections.incoming.length > 0 ||
    groupedConnections.compoundOutgoing.length > 0 ||
    groupedConnections.compoundIncoming.length > 0;

  return (
    <div className="p-6 overflow-auto h-full">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          <MathText text={text} />
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">ID: {selectedStatementId}</span>
          {category && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {category.name}
            </span>
          )}
        </div>
      </div>

      {/* Relationships */}
      {hasConnections ? (
        <div className="space-y-6">
          {/* Outgoing: this statement implies/equivalent to others */}
          {groupedConnections.outgoing.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {t.derivesThis}
              </h3>
              <div className="space-y-4">
                {groupedConnections.outgoing.map((group) => (
                  <div key={`out-${group.type}`} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <RelationshipBadge type={group.type} direction="forward" />
                      <span className="text-sm text-gray-600">
                        {RELATIONSHIP_LABELS[group.type]}
                      </span>
                    </div>
                    <ul className="space-y-2 ml-2">
                      {group.connections.map((conn, i) => (
                        <li
                          key={i}
                          onClick={() => selectStatement(conn.to)}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white px-3 py-2 rounded-lg transition-colors"
                        >
                          <span className="text-gray-400">
                            {conn.type === 'implies' && '→'}
                            {conn.type === 'inverse' && '↔'}
                            {conn.type === 'equivalent' && '⇔'}
                            {conn.type === 'subset' && '⊂'}
                          </span>
                          <span className="text-blue-600 hover:underline">
                            <MathText text={stringSet?.[conn.to] || conn.to} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incoming: others imply/equivalent to this statement */}
          {groupedConnections.incoming.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {t.derivedFromThisDirection}
              </h3>
              <div className="space-y-4">
                {groupedConnections.incoming.map((group) => (
                  <div key={`in-${group.type}`} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <RelationshipBadge type={group.type} direction="backward" />
                      <span className="text-sm text-gray-600">
                        {RELATIONSHIP_LABELS[group.type]}
                      </span>
                    </div>
                    <ul className="space-y-2 ml-2">
                      {group.connections.map((conn, i) => (
                        <li
                          key={i}
                          onClick={() => selectStatement(conn.from)}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white px-3 py-2 rounded-lg transition-colors"
                        >
                          <span className="text-gray-400">
                            {conn.type === 'implies' && '←'}
                            {conn.type === 'inverse' && '↔'}
                            {conn.type === 'equivalent' && '⇔'}
                            {conn.type === 'subset' && '⊃'}
                          </span>
                          <span className="text-blue-600 hover:underline">
                            <MathText text={stringSet?.[conn.from] || conn.from} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compound Outgoing: this statement is part of a compound condition */}
          {groupedConnections.compoundOutgoing.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {t.participatesAsPremise}
              </h3>
              <div className="space-y-4">
                {groupedConnections.compoundOutgoing.map((vn) => (
                  <CompoundConditionCard key={vn.id} vn={vn} highlightId={selectedStatementId} />
                ))}
              </div>
            </div>
          )}

          {/* Compound Incoming: this statement is the target of a compound condition */}
          {groupedConnections.compoundIncoming.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {t.derivedFromCompound}
              </h3>
              <div className="space-y-4">
                {groupedConnections.compoundIncoming.map((vn) => (
                  <CompoundConditionCard key={vn.id} vn={vn} highlightId={selectedStatementId} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          {t.noConnections}
        </p>
      )}
    </div>
  );
}
