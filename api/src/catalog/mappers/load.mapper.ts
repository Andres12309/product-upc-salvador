import type { LoadRow } from '../load-csv.js';
import { LoadRowDto, LoadSummaryDto } from '../dto/load-summary.dto.js';

export class LoadMapper {
  static toSummary(input: {
    categories: number;
    subcategories: number;
    products: number;
    rows: LoadRow[];
  }): LoadSummaryDto {
    const summary = new LoadSummaryDto();
    summary.categories = input.categories;
    summary.subcategories = input.subcategories;
    summary.products = input.products;
    summary.omitted = input.rows.filter((row) => row.status === 'omitted').length;
    summary.attention = input.rows.filter((row) => row.status === 'attention').length;
    summary.rows = input.rows.map((row) => {
      const dto = new LoadRowDto();
      dto.line = row.line;
      dto.sourceId = row.sourceId;
      dto.status = row.status;
      if (row.reason) dto.reason = row.reason;
      return dto;
    });
    return summary;
  }
}
