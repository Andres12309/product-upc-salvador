import CircularProgress from '@mui/material/CircularProgress';
import { Suspense } from 'react';
import { ProductList } from '@/modules/catalog/components/product-list';

export default function ProductosPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <ProductList />
    </Suspense>
  );
}
