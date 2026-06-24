import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // 1. Create a native PostgreSQL connection pool using your .env URL
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // 2. Instantiate the adapter
  const adapter = new PrismaPg(pool);
  
  // 3. Pass the adapter directly into the options parameter
  prismaInstance = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
}

//without this, Every API request creates a new database connection.
//Every API uses the same connection.
export const prisma = prismaInstance;