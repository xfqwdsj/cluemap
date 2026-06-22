'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { validateDataset } from '@/lib/validator';

export function ValidatorPanel() {
  const currentDataset = useStore((s) => s.getCurrentDataset());
  const selectStatement = useStore((s) => s.selectStatement);
  const t = useStore((s) => s.getLocaleMessages());
  const [isExpanded, setIsExpanded] = useState(false);

  const issues = useMemo(() => {
    if (!currentDataset) return [];
    return validateDataset(currentDataset);
  }, [currentDataset]);

  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');

  const copyToClipboard = () => {
    const lines: string[] = [];
    lines.push(`# ${t.validationReportTitle}${currentDataset?.name || t.unknownDataset}`);
    lines.push(`# ${t.generatedAt}${new Date().toLocaleString('zh-CN')}`);
    lines.push('');

    if (errors.length > 0) {
      lines.push(`## ${t.errorCount} (${errors.length})`);
      errors.forEach((issue) => {
        lines.push(`- [ERROR] ${issue.message}`);
      });
      lines.push('');
    }

    if (warnings.length > 0) {
      lines.push(`## ${t.warningCount} (${warnings.length})`);
      warnings.forEach((issue) => {
        lines.push(`- [WARN] ${issue.message}`);
      });
      lines.push('');
    }

    if (issues.length === 0) {
      lines.push(`## ${t.validationPassed}`);
      lines.push(t.noIssuesFound);
    }

    // Add dataset summary
    lines.push(`## ${t.datasetSummary}`);
    lines.push(`- ${t.nodeCount}: ${currentDataset?.statements.length || 0}`);
    lines.push(`- ${t.connectionCount}: ${currentDataset?.connections.length || 0}`);
    lines.push(`- ${t.stringSetCount}: ${currentDataset?.stringSets.length || 0}`);
    lines.push(`- ${t.categoryCount}: ${currentDataset?.categories?.length || 0}`);

    navigator.clipboard.writeText(lines.join('\n'));
  };

  if (!currentDataset) return null;

  return (
    <div className="bg-white border-t border-gray-200">
      {/* Header bar - always visible */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">{t.dataValidation}</h3>
          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
            {errors.length} {t.errorCount}
          </span>
          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
            {warnings.length} {t.warningCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard();
            }}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title={t.copyReport}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4 max-h-60 overflow-y-auto">
          {issues.length === 0 ? (
            <p className="text-sm text-green-600">✓ {t.validationPassed}，{t.noIssuesFound}</p>
          ) : (
            <div className="space-y-1">
              {errors.map((issue, i) => (
                <div
                  key={`e-${i}`}
                  className="flex items-start gap-2 text-sm text-red-600"
                >
                  <span>✗</span>
                  <span>{issue.message}</span>
                  {issue.nodeId ? (
                    <button
                      onClick={() => selectStatement(issue.nodeId!)}
                      className="text-xs underline hover:text-red-800"
                    >
                      {t.locate}
                    </button>
                  ) : null}
                </div>
              ))}
              {warnings.map((issue, i) => (
                <div
                  key={`w-${i}`}
                  className="flex items-start gap-2 text-sm text-yellow-600"
                >
                  <span>⚠</span>
                  <span>{issue.message}</span>
                  {issue.nodeId ? (
                    <button
                      onClick={() => selectStatement(issue.nodeId!)}
                      className="text-xs underline hover:text-yellow-800"
                    >
                      {t.locate}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
