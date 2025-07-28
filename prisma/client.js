const { PrismaClient } = require('@prisma/client');

// Create a single Prisma instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'] // Optional: enables detailed logs
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
