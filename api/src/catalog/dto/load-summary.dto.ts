export class LoadRowDto {
  line: number;
  sourceId: string;
  status: 'inserted' | 'omitted' | 'attention';
  reason?: string;
}

export class LoadSummaryDto {
  categories: number;
  subcategories: number;
  products: number;
  omitted: number;
  attention: number;
  rows: LoadRowDto[];
}
