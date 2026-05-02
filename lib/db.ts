import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
function normalizeDatabaseUrl(url: string) {
  try {
    const parsedUrl = new URL(url)
    const sslmode = parsedUrl.searchParams.get('sslmode')
    if (sslmode === 'prefer' || sslmode === 'require' || sslmode === 'verify-ca') {
      parsedUrl.searchParams.set('sslmode', 'verify-full')
      return parsedUrl.toString()
    }
  } catch {
    // Keep original value if URL parsing fails.
  }
  return url
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL!),
  })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
