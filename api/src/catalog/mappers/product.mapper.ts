import { ProductViewDto } from '../dto/product-view.dto.js';

type ProductSource = {
  id: string;
  upcCode: string;
  upcDescription: string;
  dateAdded: Date | null;
  updatedDate: Date | null;
  addedBy: string;
  modifiedBy: string;
  needsAttention: boolean;
  attentionReason: string | null;
  subcategory: { code: string; category: { code: string } } | null;
  category: { code: string } | null;
};

export class ProductMapper {
  static toView(product: ProductSource): ProductViewDto {
    const dto = new ProductViewDto();
    dto.id = product.id;
    dto.upcCode = product.upcCode;
    dto.upcDescription = product.upcDescription;
    dto.categoryCode = product.subcategory?.category.code ?? product.category?.code ?? null;
    dto.subCategoryCode = product.subcategory?.code ?? null;
    dto.dateAdded = utcStamp(product.dateAdded);
    dto.updatedDate = utcStamp(product.updatedDate);
    dto.addedBy = product.addedBy;
    dto.modifiedBy = product.modifiedBy;
    dto.needsAttention = product.needsAttention;
    if (product.attentionReason) dto.attentionReason = product.attentionReason;
    return dto;
  }
}

function utcStamp(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().replace(/\.\d{3}Z$/, 'Z');
}
