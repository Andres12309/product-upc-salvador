'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { deleteProduct } from '../services/api';
import type { Product } from '../types';

export function DeleteConfirm({
  product,
  onCancel,
  onDeleted,
}: {
  product: Product;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    setError('');
    try {
      await deleteProduct(product.id);
      onDeleted();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el producto');
      setPending(false);
    }
  }

  return (
    <Dialog open onClose={onCancel}>
      <DialogTitle>Eliminar producto</DialogTitle>
      <DialogContent>
        ¿Eliminar {product.upcDescription || product.upcCode}? Esta acción no se puede deshacer.
        {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={confirm} disabled={pending}>
          {pending ? 'Eliminando…' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
