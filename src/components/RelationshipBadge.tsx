'use client';

import { useStore } from '@/lib/store';
import { RelationshipType } from '@/types';

interface RelationshipBadgeProps {
  type: RelationshipType;
  direction: 'forward' | 'backward';
}

const RELATIONSHIP_SYMBOLS: Record<RelationshipType, {
  symbol: string;
  forwardIcon: string;
  backwardIcon: string;
  colors: string;
}> = {
  implies: {
    symbol: '→',
    forwardIcon: '▶',
    backwardIcon: '◀',
    colors: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  inverse: {
    symbol: '↔',
    forwardIcon: '⇄',
    backwardIcon: '⇄',
    colors: 'bg-red-100 text-red-700 border-red-300',
  },
  equivalent: {
    symbol: '⇔',
    forwardIcon: '⇔',
    backwardIcon: '⇔',
    colors: 'bg-green-100 text-green-700 border-green-300',
  },
  subset: {
    symbol: '⊂',
    forwardIcon: '⊊',
    backwardIcon: '⊋',
    colors: 'bg-purple-100 text-purple-700 border-purple-300',
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
  const config = RELATIONSHIP_SYMBOLS[type];
  const icon = direction === 'forward' ? config.forwardIcon : config.backwardIcon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.colors}`}
    >
      <span className="text-sm">{icon}</span>
      <span>{t[LABEL_KEYS[type]]}</span>
    </span>
  );
}
