'use client';
/* Re-renders subscribed components whenever the Store (browser cache) changes */
import { createContext, useContext, useEffect, useState } from 'react';
import Store from '@/lib/storage';

const DataCtx = createContext(0);

export function AppDataProvider({ children }) {
  const [version, setVersion] = useState(0);
  useEffect(() => Store.subscribe(() => setVersion(v => v + 1)), []);
  useEffect(() => {
    // keep several open tabs in sync with the same browser cache
    const onStorage = e => { if (e.key && e.key.startsWith('ush')) window.location.reload(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return <DataCtx.Provider value={version}>{children}</DataCtx.Provider>;
}

/** call in any component that reads Store so it re-renders on changes */
export const useData = () => useContext(DataCtx);
