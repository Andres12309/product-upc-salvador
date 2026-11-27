export type LoadStatus = 'inserted' | 'omitted' | 'attention';

export type LoadRow = {
  line: number;
  sourceId: string;
  status: LoadStatus;
  reason?: string;
};

export type CatalogRow = {
  line: number;
  sourceId: string;
  upcDescription: string;
  upcCode: string;
  categoryCode: string | null;
  subcategoryCode: string | null;
  dateAdded: string | null;
  updatedDate: string | null;
  addedBy: string;
  modifiedBy: string;
  needsAttention: boolean;
  attentionReason?: string;
};

export type ExistingProduct = {
  upcCode: string;
  upcDescription: string;
  categoryCode: string | null;
  subcategoryCode: string | null;
  dateAdded: Date | string | null;
  updatedDate: Date | string | null;
  addedBy: string;
  modifiedBy: string;
  attentionReason?: string | null;
};

export type UpcConflict = {
  upcCode: string;
  reason: string;
};

export type ParsedRow = {
  line: number;
  columns: string[];
};

const EXPECTED_HEADER = [
  'Id',
  'UpcDescription',
  'UpcCode',
  'CategoryCode',
  'SubCategoryCode',
  'DateAdded',
  'UpdatedDate',
  'AddedBy',
  'ModifiedBy',
];

type Draft = {
  line: number;
  sourceId: string;
  upcDescription: string;
  upcCode: string;
  categoryCode: string | null;
  subcategoryCode: string | null;
  dateAdded: string | null;
  updatedDate: string | null;
  addedBy: string;
  modifiedBy: string;
  reasons: string[];
  store: boolean;
};

export function parseCsv(text: string): ParsedRow[] {
  const source = text.replace(/^\uFEFF/, '');
  const lines = source.split(/\r?\n/);
  const header = parseLine(lines[0] ?? '');
  if (header.join('|') !== EXPECTED_HEADER.join('|')) {
    throw new Error('El CSV no tiene el encabezado esperado');
  }

  const rows: ParsedRow[] = [];
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === '') continue;
    rows.push({ line: index + 1, columns: parseLine(lines[index]) });
  }
  return rows;
}

export function classify(parsed: ParsedRow[], existing: ExistingProduct[] = []): {
  rows: LoadRow[];
  inserted: CatalogRow[];
  pairs: Array<{ categoryCode: string; subcategoryCode: string }>;
  pendingCategories: string[];
  conflicts: UpcConflict[];
} {
  const drafts = parsed.map(toDraft);
  const owner = subcategoryOwner(drafts);
  const known = new Map<string, ExistingProduct>(existing.map((product) => [product.upcCode, product]));
  const rows: LoadRow[] = [];
  const inserted: CatalogRow[] = [];
  const pairs: Array<{ categoryCode: string; subcategoryCode: string }> = [];
  const pendingCategories: string[] = [];
  const conflicts: UpcConflict[] = [];

  for (const draft of drafts) {
    const row = resolve(draft, owner);
    if (!row) {
      rows.push({
        line: draft.line,
        sourceId: draft.sourceId,
        status: 'attention',
        reason: draft.reasons.join('. ') || 'La fila no se pudo guardar',
      });
      continue;
    }

    if (!row.upcCode) {
      rows.push(attention(row));
      continue;
    }

    const current = known.get(row.upcCode);
    if (!current) {
      known.set(row.upcCode, { ...row });
      inserted.push(row);
      if (row.categoryCode && row.subcategoryCode) {
        pairs.push({ categoryCode: row.categoryCode, subcategoryCode: row.subcategoryCode });
      } else if (row.categoryCode) {
        pendingCategories.push(row.categoryCode);
      }
      rows.push(row.needsAttention ? attention(row) : { line: row.line, sourceId: row.sourceId, status: 'inserted' });
      continue;
    }

    if (sameProduct(row, current)) {
      if (row.categoryCode && row.subcategoryCode) {
        pairs.push({ categoryCode: row.categoryCode, subcategoryCode: row.subcategoryCode });
      }
      rows.push({ line: row.line, sourceId: row.sourceId, status: 'omitted', reason: 'La fila está repetida' });
      continue;
    }

    const note = `El UPC ya existe con otros datos (Id ${row.sourceId}: ${row.upcDescription})`;
    if (current.attentionReason?.includes(`Id ${row.sourceId}:`)) {
      rows.push({ line: row.line, sourceId: row.sourceId, status: 'omitted', reason: note });
      continue;
    }

    conflicts.push({ upcCode: row.upcCode, reason: note });
    current.attentionReason = current.attentionReason ? `${current.attentionReason}. ${note}` : note;
    rows.push({ line: row.line, sourceId: row.sourceId, status: 'attention', reason: note });
  }

  return { rows, inserted, pairs, pendingCategories, conflicts };
}

function toDraft(parsedRow: ParsedRow): Draft {
  const aligned = alignColumns(parsedRow.columns);
  const sourceId = (parsedRow.columns[0] ?? '').trim();
  const empty: Draft = {
    line: parsedRow.line,
    sourceId,
    upcDescription: '',
    upcCode: '',
    categoryCode: null,
    subcategoryCode: null,
    dateAdded: null,
    updatedDate: null,
    addedBy: '',
    modifiedBy: '',
    reasons: ['La fila no tiene las columnas esperadas'],
    store: false,
  };
  if (!aligned) return empty;

  const [id, description, upc, category, subcategory, dateAdded, updatedDate, addedBy, modifiedBy] = aligned.columns;
  const reasons: string[] = [];
  if (aligned.repaired) reasons.push('La descripción traía una coma sin comillas');

  const upcCode = upc.trim();
  const categoryCode = category.trim().toUpperCase() || null;
  const subcategoryCode = subcategory.trim().toUpperCase() || null;
  const added = readDate(dateAdded);
  const updated = readDate(updatedDate);
  if (!description.trim()) reasons.push('Falta el nombre');
  if (!categoryCode) reasons.push('Falta la categoría');
  if (!subcategoryCode) reasons.push('Falta la subcategoría');
  if (!/^\d{12}$/.test(upcCode)) reasons.push('El UPC debe tener 12 dígitos');
  if (added.issue) reasons.push(added.issue);
  if (updated.issue && updated.issue !== added.issue) reasons.push(updated.issue);

  const store = upcCode.length > 0 && upcCode.length <= 12;
  return {
    line: parsedRow.line,
    sourceId: id.trim(),
    upcDescription: description.trim(),
    upcCode,
    categoryCode,
    subcategoryCode,
    dateAdded: added.iso,
    updatedDate: updated.iso,
    addedBy: addedBy.trim(),
    modifiedBy: modifiedBy.trim(),
    reasons,
    store,
  };
}

function resolve(draft: Draft, owner: Map<string, string>): CatalogRow | null {
  if (!draft.store) return null;

  let categoryCode = draft.categoryCode;
  let subcategoryCode = draft.subcategoryCode;
  const reasons = [...draft.reasons];

  if (subcategoryCode) {
    const ownerCategory = owner.get(subcategoryCode) ?? null;
    if (categoryCode && ownerCategory && ownerCategory !== categoryCode) {
      reasons.push('La subcategoría pertenece a otra categoría');
      categoryCode = ownerCategory;
    } else if (!categoryCode && ownerCategory) {
      categoryCode = ownerCategory;
    } else if (!categoryCode) {
      subcategoryCode = null;
    }
  }

  const attentionReason = reasons.length > 0 ? reasons.join('. ') : undefined;
  return {
    line: draft.line,
    sourceId: draft.sourceId,
    upcDescription: draft.upcDescription,
    upcCode: draft.upcCode,
    categoryCode,
    subcategoryCode,
    dateAdded: draft.dateAdded,
    updatedDate: draft.updatedDate,
    addedBy: draft.addedBy,
    modifiedBy: draft.modifiedBy,
    needsAttention: reasons.length > 0,
    attentionReason,
  };
}

function subcategoryOwner(drafts: Draft[]): Map<string, string> {
  const counts = new Map<string, Map<string, number>>();
  for (const draft of drafts) {
    if (!draft.store || !draft.categoryCode || !draft.subcategoryCode) continue;
    const categories = counts.get(draft.subcategoryCode) ?? new Map<string, number>();
    categories.set(draft.categoryCode, (categories.get(draft.categoryCode) ?? 0) + 1);
    counts.set(draft.subcategoryCode, categories);
  }

  const owner = new Map<string, string>();
  for (const [subcategory, categories] of counts) {
    if (categories.size === 1) {
      owner.set(subcategory, [...categories.keys()][0]);
      continue;
    }
    const prefix = subcategory.split('-')[0];
    if (categories.has(prefix)) {
      owner.set(subcategory, prefix);
      continue;
    }
    let chosen = '';
    let highest = -1;
    for (const [category, count] of categories) {
      if (count > highest) {
        chosen = category;
        highest = count;
      }
    }
    owner.set(subcategory, chosen);
  }
  return owner;
}

function sameProduct(row: CatalogRow, current: ExistingProduct): boolean {
  return (
    row.upcDescription === current.upcDescription &&
    row.categoryCode === current.categoryCode &&
    row.subcategoryCode === current.subcategoryCode &&
    instant(row.dateAdded) === instant(current.dateAdded) &&
    instant(row.updatedDate) === instant(current.updatedDate) &&
    row.addedBy === current.addedBy &&
    row.modifiedBy === current.modifiedBy
  );
}

function instant(value: Date | string | null): number | null {
  if (value == null) return null;
  const time = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

function readDate(value: string): { iso: string | null; issue?: string } {
  const trimmed = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/.exec(trimmed);
  if (iso) {
    if (!calendar(Number(iso[1]), Number(iso[2]), Number(iso[3]), Number(iso[4]), Number(iso[5]), Number(iso[6]))) {
      return { iso: null, issue: 'La fecha no es válida' };
    }
    return { iso: trimmed };
  }

  const local = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(trimmed);
  if (local) {
    const year = Number(local[3]);
    const month = Number(local[2]);
    const day = Number(local[1]);
    const hour = Number(local[4]);
    const minute = Number(local[5]);
    if (!calendar(year, month, day, hour, minute, 0)) return { iso: null, issue: 'La fecha no es válida' };
    return { iso: new Date(Date.UTC(year, month - 1, day, hour, minute, 0)).toISOString().replace('.000Z', 'Z'), issue: 'La fecha no viene en UTC ISO' };
  }

  return { iso: null, issue: 'La fecha no es válida' };
}

function calendar(year: number, month: number, day: number, hour: number, minute: number, second: number): boolean {
  if (month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) return false;
  const utc = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day;
}

function attention(row: Pick<CatalogRow, 'line' | 'sourceId' | 'attentionReason'>): LoadRow {
  return { line: row.line, sourceId: row.sourceId, status: 'attention', reason: row.attentionReason };
}

function alignColumns(columns: string[]): { columns: string[]; repaired: boolean } | null {
  if (columns.length === EXPECTED_HEADER.length) return { columns, repaired: false };
  if (columns.length === EXPECTED_HEADER.length + 1 && /^\d{12}$/.test((columns[3] ?? '').trim())) {
    return {
      repaired: true,
      columns: [
        columns[0] ?? '',
        `${(columns[1] ?? '').trim()}, ${(columns[2] ?? '').trim()}`,
        columns[3] ?? '',
        columns[4] ?? '',
        columns[5] ?? '',
        columns[6] ?? '',
        columns[7] ?? '',
        columns[8] ?? '',
        columns[9] ?? '',
      ],
    };
  }
  return null;
}

function parseLine(line: string): string[] {
  const columns: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        current += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ',') {
      columns.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  columns.push(current);
  return columns;
}
