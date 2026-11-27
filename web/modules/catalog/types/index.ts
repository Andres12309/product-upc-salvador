export type Product = {
  id: string;
  upcCode: string;
  upcDescription: string;
  categoryCode: string | null;
  subCategoryCode: string | null;
  dateAdded: string | null;
  updatedDate: string | null;
  addedBy: string;
  modifiedBy: string;
  needsAttention: boolean;
  attentionReason?: string;
};

export type ProductDraft = {
  upcDescription: string;
  upcCode: string;
  categoryCode: string;
  subCategoryCode: string;
  dateAdded: string;
  updatedDate: string;
  addedBy: string;
  modifiedBy: string;
};

export type CategoryItem = { code: string };

export type ProductRef = {
  id: string;
  upcCode: string;
  upcDescription: string;
  needsAttention: boolean;
  attentionReason?: string;
};

export type CategoryTree = {
  code: string;
  subcategories: Array<{ code: string; categoryCode: string; products: ProductRef[] }>;
  pending: ProductRef[];
};
