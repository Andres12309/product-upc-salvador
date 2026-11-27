'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listCategories } from '../services/api';
import type { CategoryItem } from '../types';

export function CategoryList() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudieron leer las categorías'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Categorías</Typography>
      <Typography color="text.secondary">Elige una categoría para ver sus subcategorías y productos.</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <CircularProgress /> : null}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {categories.map((category) => (
          <Button key={category.code} component={Link} href={`/categorias/${category.code}`} variant="outlined">
            {category.code}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
