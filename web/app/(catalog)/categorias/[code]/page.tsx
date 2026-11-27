import { CategoryPage } from '@/modules/catalog/components/category-page';

export default async function CategoriaPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <CategoryPage code={decodeURIComponent(code)} />;
}