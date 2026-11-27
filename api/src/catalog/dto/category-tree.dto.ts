export class ProductRefDto {
  id: string;
  upcCode: string;
  upcDescription: string;
  needsAttention: boolean;
  attentionReason?: string;
}

export class SubcategoryViewDto {
  code: string;
  categoryCode: string;
  products: ProductRefDto[];
}

export class CategoryTreeDto {
  code: string;
  subcategories: SubcategoryViewDto[];
  pending: ProductRefDto[];
}
