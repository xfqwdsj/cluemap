'use client';

import { useStore } from '@/lib/store';
import { RELATIONSHIP_COLORS } from '@/lib/graph-utils';

const RELATIONSHIP_SYMBOLS: Record<string, string> = {
  implies: '→',
  inverse: '↔',
  equivalent: '⇔',
  subset: '⊂',
};

export function RelationshipLegend() {
  const t = useStore((s) => s.getLocaleMessages());

  const RELATIONSHIP_LABELS: Record<string, string> = {
    implies: t.impliesLabel,
    inverse: t.inverseLabel,
    equivalent: t.equivalentLabel,
    subset: t.subsetLabel,
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
      {Object.entries(RELATIONSHIP_COLORS).map(([type, color]) => (
        <div key={type} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-gray-700">
            {RELATIONSHIP_SYMBOLS[type]} {RELATIONSHIP_LABELS[type] || type}
          </span>
        </div>
      ))}
    </div>
  );
}
