// Prisma client setup for Next.js - server only
const isBrowser = typeof window !== 'undefined';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prisma: any;

if (!isBrowser) {
    // Server-side: use actual Prisma client
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");

  // Use DIRECT_URL for connection pooling (works with Vercel)
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

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