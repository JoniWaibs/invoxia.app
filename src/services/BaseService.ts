import { PrismaClient } from '../../generated/prisma/index.js';

export class BaseService {
  protected prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
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
