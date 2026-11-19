'use client';
/* Demo authentication state — session is kept in localStorage / sessionStorage */
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@/lib/services';
import { useData } from './AppDataContext';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [sessionVersion, setSessionVersion] = useState(0);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  useData(); // re-evaluate the current user whenever cached data changes
  useEffect(() => { setReady(true); }, []);
  const user = ready ? Auth.user() : null;
  const value = {
    ready, user,
    login(email, pw, remember) { const r = Auth.login(email, pw, remember); setSessionVersion(v => v + 1); return r; },
    logout() { Auth.clear(); setSessionVersion(v => v + 1); router.push('/login'); },
    register: d => Auth.register(d),
    _v: sessionVersion
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
/** current user + subscribe to data changes (use in every page) */
export function useMe() { useData(); return useAuth().user; }
