'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Product } from '../types';

export function ProductDetail({ product }: { product: Product }) {
  const rows = [
    ['Nombre', product.upcDescription || 'Sin nombre'],
    ['UPC', product.upcCode],
    ['Categoría', product.categoryCode ?? ''],
    ['Subcategoría', product.subCategoryCode ?? ''],
    ['Alta', product.dateAdded ?? ''],
    ['Modificación', product.updatedDate ?? ''],
    ['Registró', product.addedBy],
    ['Modificó', product.modifiedBy],
    ...(product.attentionReason ? [['Atención', product.attentionReason]] : []),
  ];

  return (
    <Stack spacing={2}>
      {rows.map(([label, value]) => (
        <Stack key={label} direction="row" spacing={2}>
          <Typography color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>
            {label}
          </Typography>
          <Typography>{value}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}
