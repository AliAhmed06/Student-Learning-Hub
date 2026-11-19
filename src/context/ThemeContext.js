'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ThemeCtx = createContext({ mode: 'light', resolved: 'light', setMode: () => {}, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('light');
  const [resolved, setResolved] = useState('light');
  const apply = useCallback(m => {
    const r = m === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : m;
    document.documentElement.setAttribute('data-bs-theme', r);
    setResolved(r);
  }, []);
  useEffect(() => {
    const m = localStorage.getItem('ush_theme') || 'light';
    setModeState(m); apply(m);
  }, [apply]);
  const setMode = m => { localStorage.setItem('ush_theme', m); setModeState(m); apply(m); };
  const toggle = () => setMode(resolved === 'dark' ? 'light' : 'dark');
  return <ThemeCtx.Provider value={{ mode, resolved, setMode, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
