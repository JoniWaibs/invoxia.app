import { PrismaClient } from '../../generated/prisma/index.js';

export class BaseRepository {
  protected prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async transaction<T>(
    callback: (
      prisma: Omit<
        PrismaClient,
        '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
      >
    ) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
