import app from './app';
import { prisma } from './config/database';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try{
    await prisma.$connect();
    console.log('Database connected successfully');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    })

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error(' Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();