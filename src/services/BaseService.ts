import { PrismaClient } from '@prisma/client';

export class BaseService {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  protected async transaction<T>(
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
