import { CategoryTreeDto, ProductRefDto, SubcategoryViewDto } from '../dto/category-tree.dto.js';

type ProductSource = {
  id: string;
  upcCode: string;
  upcDescription: string;
  needsAttention: boolean;
  attentionReason: string | null;
};

export class CategoryMapper {
  static toTree(input: {
    code: string;
    subcategories: Array<{ code: string; products: ProductSource[] }>;
    pendingProducts: ProductSource[];
  }): CategoryTreeDto {
    const dto = new CategoryTreeDto();
    dto.code = input.code;
    dto.subcategories = input.subcategories.map((subcategory) => {
      const view = new SubcategoryViewDto();
      view.code = subcategory.code;
      view.categoryCode = input.code;
      view.products = subcategory.products.map(CategoryMapper.toProduct);
      return view;
    });
    dto.pending = input.pendingProducts.map(CategoryMapper.toProduct);
    return dto;
  }

  private static toProduct(product: ProductSource): ProductRefDto {
    const dto = new ProductRefDto();
    dto.id = product.id;
    dto.upcCode = product.upcCode;
    dto.upcDescription = product.upcDescription;
    dto.needsAttention = product.needsAttention;
    if (product.attentionReason) dto.attentionReason = product.attentionReason;
    return dto;
  }
}
