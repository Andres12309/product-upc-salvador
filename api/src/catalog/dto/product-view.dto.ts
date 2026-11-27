export class ProductViewDto {
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
}
