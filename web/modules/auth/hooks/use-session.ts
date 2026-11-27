'use client';

import { useEffect, useState } from 'react';
import { currentUser } from '../services/api';
import { clearToken, readToken } from '../utils/token';
import type { SessionUser } from '../types';

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!readToken()) {
      setReady(true);
      return;
    }
    currentUser()
      .then((session) => {
        if (!session) clearToken();
        setUser(session);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setReady(true));
  }, []);

  function logout() {
    clearToken();
    setUser(null);
  }

  return { user, ready, setUser, logout };
}
