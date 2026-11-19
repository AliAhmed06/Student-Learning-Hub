'use client';
import { useEffect, useState } from 'react';
import { AppDataProvider } from '@/context/AppDataContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { UIProvider } from '@/context/UIContext';

/* The data lives in the browser cache, so the app renders on the client only
   (avoids server/client mismatches while there is no real database). */
export default function Providers({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}><div className="text-center text-muted"><div className="spinner-border text-primary mb-3" role="status" /><div>Loading University Student Hub…</div></div></div>;
  return <ThemeProvider><AppDataProvider><AuthProvider><UIProvider>{children}</UIProvider></AuthProvider></AppDataProvider></ThemeProvider>;
}
