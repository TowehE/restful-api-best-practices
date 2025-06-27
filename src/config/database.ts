import { PrismaClient } from '@prisma/client';

class DatabaseConfig {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? [ 'error', 'warn'] : ['error'],
      });
    }
    return DatabaseConfig.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseConfig.instance) {
      await DatabaseConfig.instance.$disconnect();
    }
  }
}

export const prisma = DatabaseConfig.getInstance();