'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSessionContext } from '@/modules/auth/hooks/session-context';
import { AppHeader } from '@/modules/shell/components/app-header';

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, ready } = useSessionContext();

  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppHeader />
      <Box component="main" sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {children}
      </Box>
    </>
  );
}
