import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './server.js';
import { prisma } from './db/prisma.js';

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 Swagger API Docs at: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
