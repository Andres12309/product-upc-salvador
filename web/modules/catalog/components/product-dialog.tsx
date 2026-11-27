'use client';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type { SessionUser } from '@/modules/auth/types';
import { ProductForm } from './product-form';
import type { Product } from '../types';

export function ProductDialog({
  open,
  user,
  id,
  products,
  onClose,
  onSaved,
}: {
  open: boolean;
  user: SessionUser;
  id?: string;
  products: Product[];
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle>{id ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
      <DialogContent>
        {open ? (
          <ProductForm
            key={id ?? 'nuevo'}
            user={user}
            id={id}
            products={products}
            onCancel={onClose}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
