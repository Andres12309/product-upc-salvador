'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCategory } from '../services/api';
import type { CategoryTree, ProductRef } from '../types';

function ProductLinks({ products }: { products: ProductRef[] }) {
  if (products.length === 0) {
    return <Typography color="text.secondary">Sin productos</Typography>;
  }
  return (
    <List dense>
      {products.map((product) => (
        <ListItemButton key={product.id} component={Link} href={`/productos/${product.id}`}>
          <ListItemText primary={product.upcDescription || 'Sin nombre'} secondary={product.upcCode} />
          {product.needsAttention ? <Chip size="small" color="warning" label="Revisar" /> : null}
        </ListItemButton>
      ))}
    </List>
  );
}

export function CategoryPage({ code }: { code: string }) {
  const [category, setCategory] = useState<CategoryTree | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategory(code)
      .then(setCategory)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudo leer la categoría'));
  }, [code]);

  return (
    <Stack spacing={2}>
      <Button component={Link} href="/categorias" sx={{ alignSelf: 'flex-start' }}>
        Volver a categorías
      </Button>
      <Typography variant="h4">{category?.code ?? code}</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!category && !error ? <CircularProgress /> : null}
      {category?.subcategories.map((subcategory) => (
        <Paper key={subcategory.code} sx={{ p: 2 }}>
          <Typography variant="h6">{subcategory.code}</Typography>
          <ProductLinks products={subcategory.products} />
        </Paper>
      ))}
      {category && category.pending.length > 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Sin subcategoría</Typography>
          <ProductLinks products={category.pending} />
        </Paper>
      ) : null}
    </Stack>
  );
}
