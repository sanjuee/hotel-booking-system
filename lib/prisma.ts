// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Get the URL from your .env file
const connectionString = `${process.env.DATABASE_URL}`;

// This function creates the connection
const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Next.js Global variables to prevent connection crashing during development
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// Export the single instance
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma