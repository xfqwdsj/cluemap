'use client';

import { useStore } from '@/lib/store';
import { RelationshipType } from '@/types';

interface RelationshipBadgeProps {
  type: RelationshipType;
  direction: 'forward' | 'backward';
}

const RELATIONSHIP_CONFIG: Record<RelationshipType, {
  symbol: string;
  forwardIcon: string;
  backwardIcon: string;
  colorVar: string;
}> = {
  implies: {
    symbol: '→',
    forwardIcon: '▶',
    backwardIcon: '◀',
    colorVar: 'var(--accent)',
  },
  inverse: {
    symbol: '↔',
    forwardIcon: '⇄',
    backwardIcon: '⇄',
    colorVar: '#ef4444',
  },
  equivalent: {
    symbol: '⇔',
    forwardIcon: '⇔',
    backwardIcon: '⇔',
    colorVar: '#10b981',
  },
  subset: {
    symbol: '⊂',
    forwardIcon: '⊊',
    backwardIcon: '⊋',
    colorVar: '#8b5cf6',
  },
};

const LABEL_KEYS: Record<RelationshipType, 'impliesLabel' | 'inverseLabel' | 'equivalentLabel' | 'subsetLabel'> = {
  implies: 'impliesLabel',
  inverse: 'inverseLabel',
  equivalent: 'equivalentLabel',
  subset: 'subsetLabel',
};

export function RelationshipBadge({ type, direction }: RelationshipBadgeProps) {
  const t = useStore((s) => s.getLocaleMessages());
  const config = RELATIONSHIP_CONFIG[type];
  const icon = direction === 'forward' ? config.forwardIcon : config.backwardIcon;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: `color-mix(in srgb, ${config.colorVar} 15%, transparent)`,
        color: config.colorVar,
        borderColor: `color-mix(in srgb, ${config.colorVar} 30%, transparent)`,
      }}
    >
      <span className="text-sm">{icon}</span>
      <span>{t[LABEL_KEYS[type]]}</span>
    </span>
  );
}
