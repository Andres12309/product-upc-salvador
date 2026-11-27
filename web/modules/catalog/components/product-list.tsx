'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSessionContext } from '@/modules/auth/hooks/session-context';
import { listProducts } from '../services/api';
import { DeleteConfirm } from './delete-confirm';
import { ProductDialog } from './product-dialog';
import { ProductTable } from './product-table';
import type { Product } from '../types';
import { usePageAction } from '../hooks/use-page-action';

export function ProductList() {
  const router = useRouter();
  const { user } = useSessionContext();
  const { action, targetId, open, close } = usePageAction();
  const canWrite = user?.role === 'admin';
  const [products, setProducts] = useState<Product[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function reload() {
    return listProducts().then(setProducts);
  }

  useEffect(() => {
    reload()
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudo leer el catálogo'))
      .finally(() => setLoading(false));
  }, []);

  const editingId = action === 'editar' ? targetId ?? undefined : undefined;
  const deleting = products.find((product) => product.id === targetId);

  function saved(message: string) {
    setNotice(message);
    setError('');
    reload().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudo leer el catálogo'));
    close();
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h4">Productos</Typography>
          <Typography color="text.secondary">Listado del catálogo</Typography>
        </Box>
        {canWrite ? (
          <Button variant="contained" onClick={() => open('nuevo')}>
            Nuevo producto
          </Button>
        ) : null}
      </Stack>
      {notice ? <Alert severity="success">{notice}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <CircularProgress /> : null}
      {!loading ? (
        <Paper>
          <ProductTable
            products={products}
            canWrite={canWrite}
            onOpen={(id) => router.push(`/productos/${id}`)}
            onEdit={(id) => open('editar', id)}
            onDelete={(product) => open('eliminar', product.id)}
          />
        </Paper>
      ) : null}
      {canWrite && user && (action === 'nuevo' || action === 'editar') ? (
        <ProductDialog
          open
          user={user}
          id={editingId}
          products={products}
          onClose={close}
          onSaved={() => saved('Producto guardado.')}
        />
      ) : null}
      {canWrite && action === 'eliminar' && deleting ? (
        <DeleteConfirm product={deleting} onCancel={close} onDeleted={() => saved('Producto eliminado.')} />
      ) : null}
    </Stack>
  );
}
