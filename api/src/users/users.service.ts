import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { Prisma, type PrismaClient } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthUser, DEFAULT_USERS } from './user.js';

type Credentials = {
  user: AuthUser;
  passwordHash: string;
};

type UserStore = Pick<PrismaClient, 'user'>;

/** La historia 1 llama a esta función. No reescribe un hash ya guardado. */
export async function ensureDefaultUsers(db: UserStore, hasher: PasswordHasher): Promise<void> {
  for (const account of DEFAULT_USERS) {
    const existing = await db.user.findUnique({
      where: { username: account.username },
      select: { id: true },
    });
    if (existing) continue;

    try {
      await db.user.create({
        data: {
          username: account.username,
          role: account.role,
          passwordHash: await hasher.hash(account.password),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') continue;
      throw error;
    }
  }
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true },
    });
  }

  async findCredentials(username: string): Promise<Credentials | null> {
    const row = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, role: true, passwordHash: true },
    });
    if (!row) return null;
    return {
      user: { id: row.id, username: row.username, role: row.role },
      passwordHash: row.passwordHash,
    };
  }
}
