const base = (process.env.API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

let response;
try {
  response = await fetch(`${base}/load`, { method: 'POST' });
} catch {
  console.error(`No hay API en ${base}. Levántala con npm run start:dev.`);
  process.exit(1);
}

const body = await response.json().catch(() => null);
if (!response.ok || !body) {
  const message = body && typeof body.message === 'string' ? body.message : `La API respondió ${response.status}`;
  console.error(message);
  process.exit(1);
}

console.log(`Categorías: ${body.categories}`);
console.log(`Subcategorías: ${body.subcategories}`);
console.log(`Productos: ${body.products}`);
console.log(`Omitidas: ${body.omitted}`);
console.log(`Requieren atención: ${body.attention}`);

for (const row of body.rows ?? []) {
  if (row.status !== 'attention') continue;
  console.log(`${row.line}\t${row.sourceId}\tattention — ${row.reason ?? ''}`);
}
