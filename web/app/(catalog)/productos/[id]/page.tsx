import CircularProgress from '@mui/material/CircularProgress';
import { Suspense } from 'react';
import { ProductPage } from '@/modules/catalog/components/product-page';

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<CircularProgress />}>
      <ProductPage id={id} />
    </Suspense>
  );
}
