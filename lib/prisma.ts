import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Use a global variable to preserve the Prisma client across hot reloads in development
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl || process.env.NEXT_PHASE === 'phase-production-build') {
    // Return a dummy client or one that won't try to connect during build
    return new PrismaClient({
      log: ["error", "warn"],
    });
  }

  try {
    const pool = new pg.Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    
    return new PrismaClient({
      adapter,
      log: ["error", "warn"],
    });
  } catch (error) {
    console.error("Failed to initialize Prisma with adapter:", error);
    return new PrismaClient({
      log: ["error", "warn"],
    });
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;