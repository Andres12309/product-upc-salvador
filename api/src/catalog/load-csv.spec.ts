import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { classify, parseCsv } from './load-csv.js';

const parsed = parseCsv(readFileSync(join(process.cwd(), '../data/productos.csv'), 'utf8'));
const first = classify(parsed);

function rowsOf(sourceId: string) {
  return first.rows.filter((row) => row.sourceId === sourceId);
}

function stored(sourceId: string) {
  return first.inserted.find((row) => row.sourceId === sourceId);
}

describe('carga del CSV', () => {
  it('conserva el cero del UPC y guarda el de 11 dígitos para revisión', () => {
    expect(stored('102')).toMatchObject({ upcCode: '010433218194', needsAttention: false });
    expect(stored('103')).toMatchObject({
      upcCode: '10433218194',
      needsAttention: true,
      attentionReason: 'El UPC debe tener 12 dígitos',
    });
    expect(rowsOf('103')[0].status).toBe('attention');
  });

  it('guarda las filas dudosas y repara la coma sin comillas', () => {
    expect(stored('104')?.attentionReason).toBe('El UPC debe tener 12 dígitos');
    expect(stored('105')?.attentionReason).toBe('El UPC debe tener 12 dígitos');
    expect(stored('111')).toMatchObject({ upcDescription: '', attentionReason: 'Falta el nombre' });
    expect(stored('113')).toMatchObject({ categoryCode: 'LIM', subcategoryCode: 'LIM-PAP', attentionReason: 'Falta la categoría' });
    expect(stored('114')).toMatchObject({ categoryCode: 'SNK', subcategoryCode: null, attentionReason: 'Falta la subcategoría' });
    expect(stored('115')).toMatchObject({ dateAdded: null, attentionReason: 'La fecha no es válida' });
    expect(stored('116')).toMatchObject({
      dateAdded: '2026-03-15T10:00:00Z',
      attentionReason: 'La fecha no viene en UTC ISO',
    });
    expect(stored('118')).toMatchObject({
      upcCode: '930103105183',
      upcDescription: 'Cereal Maíz Azucarado 500g, Pack 2',
      attentionReason: 'La descripción traía una coma sin comillas',
    });
    expect(stored('109')).toMatchObject({
      upcDescription: 'Galletas de Avena, Pasas y Miel 300g',
      needsAttention: false,
    });
  });

  it('enlaza la subcategoría ajena a su categoría real y no duplica el UPC', () => {
    expect(rowsOf('2').map((row) => row.status)).toEqual(['inserted', 'omitted']);
    expect(rowsOf('9')[0].status).toBe('inserted');
    expect(stored('9')?.needsAttention).toBe(false);
    expect(rowsOf('101')[0]).toMatchObject({
      status: 'attention',
      reason: 'El UPC ya existe con otros datos (Id 101: Jugo de Naranja Natural 1L)',
    });
    expect(stored('101')).toBeUndefined();
    expect(first.conflicts).toEqual([
      { upcCode: '731135748917', reason: 'El UPC ya existe con otros datos (Id 101: Jugo de Naranja Natural 1L)' },
    ]);
    expect(rowsOf('107')[0].status).toBe('inserted');
    expect(stored('108')).toMatchObject({ categoryCode: 'LAC', subcategoryCode: 'LAC-YOG', needsAttention: false });
    expect(rowsOf('50').map((row) => row.status)).toEqual(['inserted', 'inserted']);
    expect(stored('112')).toMatchObject({
      categoryCode: 'LAC',
      subcategoryCode: 'LAC-LEC',
      attentionReason: 'La subcategoría pertenece a otra categoría',
    });
  });

  it('marca estas filas y ninguna otra', () => {
    const attention = first.rows.filter((row) => row.status === 'attention').map((row) => row.sourceId);
    expect(attention).toEqual(['101', '103', '104', '105', '111', '112', '113', '114', '115', '116', '118']);
    expect(first.inserted.every((row) => row.subcategoryCode !== 'LAC-LEC' || row.categoryCode === 'LAC')).toBe(true);
  });

  it('la segunda pasada no inserta nada nuevo', () => {
    const existing = first.inserted.map((row) => ({ ...row }));
    for (const conflict of first.conflicts) {
      const product = existing.find((row) => row.upcCode === conflict.upcCode);
      if (product) product.attentionReason = conflict.reason;
    }
    const again = classify(parsed, existing);
    expect(again.inserted).toHaveLength(0);
    expect(again.conflicts).toHaveLength(0);
    expect(again.rows.filter((row) => row.status === 'omitted')).toHaveLength(parsed.length);
  });
});
