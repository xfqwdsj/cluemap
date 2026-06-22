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

  const highlightClass = 'text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-bold';
  const normalClass = 'cursor-pointer hover:text-blue-600 hover:underline';

  // Sort premises: highlighted one first
  const sortedPremises = [...vn.premises];
  const highlightIndex = sortedPremises.indexOf(highlightId || '');
  if (highlightIndex > 0) {
    sortedPremises.splice(highlightIndex, 1);
    sortedPremises.unshift(highlightId!);
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 my-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-amber-600 font-mono text-lg font-bold">
          {vn.type === 'and' ? '∧' : '∨'}
        </span>
        <span className="text-sm font-medium text-amber-800">
          {vn.type === 'and' ? t.andCondition : t.orCondition}
        </span>
      </div>

      <div className="text-sm ml-6">
        {sortedPremises.map((p, i) => (
          <span key={p}>
            {i > 0 && (
              <span className="text-amber-600 font-mono mx-1">
                {vn.type === 'and' ? '∧' : '∨'}
              </span>
            )}
            <span
              onClick={() => selectStatement(p)}
              className={highlightId === p ? highlightClass : normalClass}
            >
              <MathText text={stringSet?.[p] || p} />
            </span>
          </span>
        ))}

        <span className="text-gray-400 mx-2">→</span>

        <span
          onClick={() => selectStatement(vn.target)}
          className={highlightId === vn.target ? highlightClass : normalClass}
        >
          <MathText text={targetText} />
        </span>
      </div>
    </div>
  );
}
