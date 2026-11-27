import '../src/load-env.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module.js';
import { CatalogService } from '../src/catalog/catalog.service.js';

const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

try {
  const summary = await app.get(CatalogService).load();
  console.log(`Categorías: ${summary.categories}`);
  console.log(`Subcategorías: ${summary.subcategories}`);
  console.log(`Productos: ${summary.products}`);
  console.log(`Omitidos: ${summary.omitted}`);
  console.log(`Requieren atención: ${summary.attention}`);
  for (const row of summary.rows) {
    if (row.status !== 'attention') continue;
    console.log(`L${row.line} id ${row.sourceId}: ${row.reason}`);
  }
} finally {
  await app.close();
}
