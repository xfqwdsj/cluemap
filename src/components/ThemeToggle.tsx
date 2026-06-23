'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { IconButton } from './ui/IconButton';

type Theme = 'system' | 'light' | 'dark';

const THEME_ORDER: Theme[] = ['system', 'light', 'dark'];

function getNextTheme(current: Theme): Theme {
  const idx = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <IconButton disabled>
        <div className="w-4 h-4" />
      </IconButton>
    );
  }

  const currentTheme = (theme || 'system') as Theme;
  const nextTheme = getNextTheme(currentTheme);

  const handleClick = () => {
    setTheme(nextTheme);
  };

  const icons: Record<Theme, React.ReactNode> = {
    system: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    light: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    dark: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  };

  const labels: Record<Theme, string> = {
    system: '跟随系统',
    light: '亮色模式',
    dark: '暗色模式',
  };

  return (
    <IconButton onClick={handleClick} title={labels[currentTheme]}>
      {icons[currentTheme]}
    </IconButton>
  );
}
