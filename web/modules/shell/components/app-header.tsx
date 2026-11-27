'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSessionContext } from '@/modules/auth/hooks/session-context';

const links = [
  { href: '/productos', label: 'Productos' },
  { href: '/categorias', label: 'Categorías' },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useSessionContext();

  function exit() {
    logout();
    router.replace('/login');
  }

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          Catálogo
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                color={active ? 'primary' : 'inherit'}
                sx={{ fontWeight: active ? 700 : 500 }}
              >
                {link.label}
              </Button>
            );
          })}
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Typography color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {user?.username} · {user?.role}
        </Typography>
        <Button color="inherit" onClick={exit}>
          Cerrar sesión
        </Button>
      </Toolbar>
    </AppBar>
  );
}
