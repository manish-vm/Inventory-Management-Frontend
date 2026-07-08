import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themeTokens = {
  light: {
    page: 'bg-slate-50 text-slate-900',
    surface: 'border-slate-200 bg-white text-slate-900',
    mutedText: 'text-slate-500',
    hero: 'border border-sky-100 bg-sky-50 text-slate-950',
    heroEyebrow: 'text-sky-700',
    heroBody: 'text-slate-600',
    scannerPreview: 'border border-slate-200 bg-slate-100 text-slate-600',
    scannerInactiveOverlay: 'bg-slate-100/95 text-slate-600',
    scannerFrame: 'border-blue-500 shadow-[0_0_0_9999px_rgba(148,163,184,0.28)]'
  },
  dark: {
    page: 'bg-slate-900 text-white',
    surface: 'border-slate-700 bg-slate-800 text-white',
    mutedText: 'text-slate-400',
    hero: 'bg-slate-950 text-white',
    heroEyebrow: 'text-sky-200',
    heroBody: 'text-slate-200',
    scannerPreview: 'bg-slate-950 text-slate-300',
    scannerInactiveOverlay: 'bg-slate-950 text-slate-300',
    scannerFrame: 'border-blue-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]'
  }
};

export const createThemeFactory = (theme = 'light') => {
  const activeTheme = theme === 'dark' ? 'dark' : 'light';
  const tokens = themeTokens[activeTheme];

  return {
    name: activeTheme,
    tokens,
    classFor: (component, fallback = '') => tokens[component] || fallback
  };
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const themeFactory = useMemo(() => createThemeFactory(theme), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeFactory }}>
      {children}
    </ThemeContext.Provider>
  );
};

