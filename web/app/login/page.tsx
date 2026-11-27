'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoginForm } from '@/modules/auth/components/login-form';
import { useSessionContext } from '@/modules/auth/hooks/session-context';

export default function LoginPage() {
  const router = useRouter();
  const { user, ready, setUser } = useSessionContext();

  useEffect(() => {
    if (ready && user) router.replace('/productos');
  }, [ready, user, router]);

  if (!ready || user) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LoginForm
      onSuccess={(session) => {
        setUser(session);
        router.push('/productos');
      }}
    />
  );
}
