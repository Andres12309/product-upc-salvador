'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSessionContext } from '@/modules/auth/hooks/session-context';
import { getProduct, listProducts } from '../services/api';
import { DeleteConfirm } from './delete-confirm';
import { ProductDetail } from './product-detail';
import { ProductDialog } from './product-dialog';
import type { Product } from '../types';
import { usePageAction } from '../hooks/use-page-action';

export function ProductPage({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useSessionContext();
  const { action, open, close } = usePageAction();
  const canWrite = user?.role === 'admin';
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function reload() {
    return getProduct(id).then(setProduct);
  }

  useEffect(() => {
    reload().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudo leer el producto'));
    listProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [id]);

  function saved() {
    setNotice('Producto guardado.');
    setError('');
    reload().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudo leer el producto'));
    close();
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Button component={Link} href="/productos">
          Volver al listado
        </Button>
        {canWrite && product ? (
          <Button onClick={() => open('editar')}>Editar</Button>
        ) : null}
        {canWrite && product ? (
          <Button color="error" onClick={() => open('eliminar')}>
            Eliminar
          </Button>
        ) : null}
      </Stack>
      <Typography variant="h4">{product?.upcDescription || 'Producto'}</Typography>
      {notice ? <Alert severity="success">{notice}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!product && !error ? <CircularProgress /> : null}
      {product ? (
        <Paper sx={{ p: 3 }}>
          <ProductDetail product={product} />
        </Paper>
      ) : null}
      {canWrite && user && action === 'editar' ? (
        <ProductDialog open user={user} id={id} products={products} onClose={close} onSaved={saved} />
      ) : null}
      {canWrite && action === 'eliminar' && product ? (
        <DeleteConfirm
          product={product}
          onCancel={close}
          onDeleted={() => router.replace('/productos')}
        />
      ) : null}
    </Stack>
  );
}
