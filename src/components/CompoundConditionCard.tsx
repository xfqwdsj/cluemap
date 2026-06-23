'use client';

import { useStore } from '@/lib/store';
import { VirtualNode } from '@/types';
import { MathText } from './MathText';

interface CompoundConditionCardProps {
  vn: VirtualNode;
  highlightId?: string;
}

export function CompoundConditionCard({ vn, highlightId }: CompoundConditionCardProps) {
  const selectStatement = useStore((s) => s.selectStatement);
  const stringSet = useStore((s) => s.getCurrentStringSet());
  const t = useStore((s) => s.getLocaleMessages());

  const targetText = stringSet?.[vn.target] || vn.target;

  const highlightClass = 'px-1.5 py-0.5 rounded font-bold';
  const normalClass = 'cursor-pointer hover:underline';

  const sortedPremises = [...vn.premises];
  const highlightIndex = sortedPremises.indexOf(highlightId || '');
  if (highlightIndex > 0) {
    sortedPremises.splice(highlightIndex, 1);
    sortedPremises.unshift(highlightId!);
  }

  return (
    <div
      className="border rounded-lg p-3 my-2"
      style={{
        backgroundColor: 'var(--warning-bg)',
        borderColor: 'var(--warning-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-lg font-bold" style={{ color: 'var(--warning-text)' }}>
          {vn.type === 'and' ? '∧' : '∨'}
        </span>
        <span className="text-sm font-medium" style={{ color: 'var(--warning-text)' }}>
          {vn.type === 'and' ? t.andCondition : t.orCondition}
        </span>
      </div>

      <div className="text-sm ml-6">
        {sortedPremises.map((p, i) => (
          <span key={p}>
            {i > 0 && (
              <span className="font-mono mx-1" style={{ color: 'var(--warning-text)' }}>
                {vn.type === 'and' ? '∧' : '∨'}
              </span>
            )}
            <span
              onClick={() => selectStatement(p)}
              className={highlightId === p ? highlightClass : normalClass}
              style={{
                color: highlightId === p ? 'var(--accent-text)' : 'var(--text-secondary)',
                backgroundColor: highlightId === p ? 'var(--accent-muted)' : undefined,
              }}
            >
              <MathText text={stringSet?.[p] || p} />
            </span>
          </span>
        ))}

        <span className="mx-2" style={{ color: 'var(--text-placeholder)' }}>→</span>

        <span
          onClick={() => selectStatement(vn.target)}
          className={highlightId === vn.target ? highlightClass : normalClass}
          style={{
            color: highlightId === vn.target ? 'var(--accent-text)' : 'var(--text-secondary)',
            backgroundColor: highlightId === vn.target ? 'var(--accent-muted)' : undefined,
          }}
        >
          <MathText text={targetText} />
        </span>
      </div>
    </div>
  );
}
