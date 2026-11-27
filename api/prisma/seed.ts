import '../src/load-env.js';
import { PasswordHasher } from '@nestjs/authentication';
import { PrismaPg } from '@prisma/adapter-pg';
import { ensureDefaultUsers } from '../src/users/users.service.js';
import { PrismaClient } from '../src/generated/prisma/client.js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Falta DATABASE_URL');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

try {
  await ensureDefaultUsers(prisma, new PasswordHasher());
} finally {
  await prisma.$disconnect();
}
