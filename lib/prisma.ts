// Prisma client setup for Next.js - server only
const isBrowser = typeof window !== 'undefined';

let prisma: any;

if (!isBrowser) {
  // Server-side: use actual Prisma client
  const { PrismaClient } = require("@prisma/client");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");

  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  prisma = new PrismaClient({ adapter });
} else {
  // Browser: provide minimal mock to prevent errors
  prisma = {
    restaurant: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
    },
    dish: {
      findMany: () => Promise.resolve([]),
      create: () => Promise.resolve({}),
    },
  };
}

export default prisma;