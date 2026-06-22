'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
}

function renderLatex(text: string): string {
  // Match LaTeX between $ and $ (inline math)
  return text.replace(/\$([^$]+)\$/g, (_, latex) => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return `<span class="text-red-500">${latex}</span>`;
    }
  });
}

export function MathText({ text, className = '' }: MathTextProps) {
  const html = useMemo(() => renderLatex(text), [text]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
