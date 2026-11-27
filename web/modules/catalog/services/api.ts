import { readToken } from '@/modules/auth/utils/token';
import { apiError, http } from '@/modules/shared/services/http';
import type { CategoryItem, CategoryTree, Product, ProductDraft } from '../types';

async function call<T>(run: () => Promise<T>, fallback: string): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw new Error(apiError(error, fallback));
  }
}

export function listProducts(): Promise<Product[]> {
  return call(async () => (await http.get<Product[]>('/products')).data, 'No se pudo leer el catálogo');
}

export function getProduct(id: string): Promise<Product> {
  return call(async () => (await http.get<Product>(`/products/${id}`)).data, 'No se pudo leer el producto');
}

export function listCategories(): Promise<CategoryItem[]> {
  return call(async () => (await http.get<CategoryItem[]>('/categories')).data, 'No se pudieron leer las categorías');
}

export function getCategory(categoryCode: string): Promise<CategoryTree> {
  return call(
    async () => (await http.get<CategoryTree>(`/categories/${categoryCode}/subcategories`)).data,
    'No se pudo leer la categoría',
  );
}

export function listSubcategories(categoryCode: string): Promise<string[]> {
  return call(async () => {
    const { data } = await http.get<{ subcategories?: Array<{ code: string }> }>(
      `/categories/${categoryCode}/subcategories`,
    );
    return (data.subcategories ?? []).map((item) => item.code);
  }, 'No se pudieron leer las subcategorías');
}

export function saveProduct(draft: ProductDraft, id?: string): Promise<Product> {
  const payload = { ...draft, token: readToken() };
  return call(async () => {
    const response = id
      ? await http.put<Product>(`/products/${id}`, payload)
      : await http.post<Product>('/products', payload);
    return response.data;
  }, 'No se pudo guardar el producto');
}

export function deleteProduct(id: string): Promise<void> {
  return call(async () => {
    await http.get(`/products/${id}/delete`, { data: { token: readToken() } });
  }, 'No se pudo eliminar el producto');
}
