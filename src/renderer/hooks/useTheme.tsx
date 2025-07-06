import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateResolvedTheme);
      return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    // Set CSS custom properties
    if (resolvedTheme === 'light') {
      root.style.setProperty('--bg-primary', '#fefcfb');
      root.style.setProperty('--bg-secondary', '#f9f7f4');
      root.style.setProperty('--bg-elevated', '#ffffff');
      root.style.setProperty('--text-primary', '#1a1a1a');
      root.style.setProperty('--text-secondary', '#525252');
      root.style.setProperty('--text-tertiary', '#a3a3a3');
      root.style.setProperty('--border-primary', '#e5e5e5');
      root.style.setProperty('--border-secondary', '#f0f0f0');
      root.style.setProperty('--accent-primary', '#3b82f6');
      root.style.setProperty('--accent-secondary', '#6366f1');
      root.style.setProperty('--shadow-subtle', '0 1px 3px rgba(0,0,0,0.1)');
      root.style.setProperty('--shadow-medium', '0 4px 6px rgba(0,0,0,0.1)');
      root.style.setProperty('--shadow-large', '0 10px 15px rgba(0,0,0,0.1)');
    } else {
      root.style.setProperty('--bg-primary', '#1a1a1a');
      root.style.setProperty('--bg-secondary', '#262626');
      root.style.setProperty('--bg-elevated', '#2a2a2a');
      root.style.setProperty('--text-primary', '#fafaf9');
      root.style.setProperty('--text-secondary', '#d4d4d8');
      root.style.setProperty('--text-tertiary', '#71717a');
      root.style.setProperty('--border-primary', '#404040');
      root.style.setProperty('--border-secondary', '#333333');
      root.style.setProperty('--accent-primary', '#60a5fa');
      root.style.setProperty('--accent-secondary', '#a78bfa');
      root.style.setProperty('--shadow-subtle', '0 1px 3px rgba(0,0,0,0.3)');
      root.style.setProperty('--shadow-medium', '0 4px 6px rgba(0,0,0,0.3)');
      root.style.setProperty('--shadow-large', '0 10px 15px rgba(0,0,0,0.3)');
    }
  }, [resolvedTheme, theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}