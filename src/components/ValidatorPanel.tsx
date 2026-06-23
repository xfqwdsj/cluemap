'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { validateDataset } from '@/lib/validator';
import { IconButton } from './ui/IconButton';

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

    lines.push(`## ${t.datasetSummary}`);
    lines.push(`- ${t.nodeCount}: ${currentDataset?.statements.length || 0}`);
    lines.push(`- ${t.connectionCount}: ${currentDataset?.connections.length || 0}`);
    lines.push(`- ${t.stringSetCount}: ${currentDataset?.stringSets.length || 0}`);
    lines.push(`- ${t.categoryCount}: ${currentDataset?.categories?.length || 0}`);

    navigator.clipboard.writeText(lines.join('\n'));
  };

  if (!currentDataset) return null;

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-primary)' }}>
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer transition-colors"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.dataValidation}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
            {errors.length} {t.errorCount}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
            {warnings.length} {t.warningCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <IconButton
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard();
            }}
            title={t.copyReport}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </IconButton>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 max-h-60 overflow-y-auto">
          {issues.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--success-text)' }}>✓ {t.validationPassed}，{t.noIssuesFound}</p>
          ) : (
            <div className="space-y-1">
              {errors.map((issue, i) => (
                <div
                  key={`e-${i}`}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: 'var(--error-text)' }}
                >
                  <span>✗</span>
                  <span>{issue.message}</span>
                  {issue.nodeId ? (
                    <button
                      onClick={() => selectStatement(issue.nodeId!)}
                      className="text-xs underline"
                    >
                      {t.locate}
                    </button>
                  ) : null}
                </div>
              ))}
              {warnings.map((issue, i) => (
                <div
                  key={`w-${i}`}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: 'var(--warning-text)' }}
                >
                  <span>⚠</span>
                  <span>{issue.message}</span>
                  {issue.nodeId ? (
                    <button
                      onClick={() => selectStatement(issue.nodeId!)}
                      className="text-xs underline"
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
