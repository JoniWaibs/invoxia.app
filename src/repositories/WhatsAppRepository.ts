import type {
  WhatsAppSession,
  WhatsAppIncoming,
  SessionState,
} from '@generated/prisma';
import { BaseRepository } from './BaseRepository';

export class WhatsAppSessionRepository extends BaseRepository {
  async create(data: {
    userId: string;
    tenantId: string;
    state?: SessionState;
    batchId?: string;
  }): Promise<WhatsAppSession> {
    return this.prisma.whatsAppSession.create({
      data,
      include: {
        user: true,
        tenant: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<WhatsAppSession | null> {
    return this.prisma.whatsAppSession.findUnique({
      where: { userId },
      include: {
        user: true,
        tenant: true,
      },
    });
  }

  async upsert(data: {
    userId: string;
    tenantId: string;
    state: SessionState;
    batchId?: string;
  }): Promise<WhatsAppSession> {
    return this.prisma.whatsAppSession.upsert({
      where: { userId: data.userId },
      create: data,
      update: {
        tenantId: data.tenantId,
        state: data.state,
        ...(data.batchId !== undefined && { batchId: data.batchId }),
        updatedAt: new Date(),
      },
      include: {
        user: true,
        tenant: true,
      },
    });
  }

  async updateState(
    userId: string,
    state: SessionState,
    batchId?: string
  ): Promise<WhatsAppSession> {
    return this.prisma.whatsAppSession.update({
      where: { userId },
      data: {
        state,
        ...(batchId !== undefined && { batchId }),
        updatedAt: new Date(),
      },
      include: {
        user: true,
        tenant: true,
      },
    });
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.whatsAppSession.delete({
      where: { userId },
    });
  }
}

export class WhatsAppIncomingRepository extends BaseRepository {
  async create(data: {
    messageId: string;
    userId?: string;
    tenantId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
  }): Promise<WhatsAppIncoming> {
    return this.prisma.whatsAppIncoming.create({
      data: {
        messageId: data.messageId,
        ...(data.userId && { userId: data.userId }),
        ...(data.tenantId && { tenantId: data.tenantId }),
        payload: data.payload || null,
      },
    });
  }

  async findByMessageId(messageId: string): Promise<WhatsAppIncoming | null> {
    return this.prisma.whatsAppIncoming.findUnique({
      where: { messageId },
    });
  }

  async markAsProcessed(messageId: string): Promise<WhatsAppIncoming> {
    return this.prisma.whatsAppIncoming.update({
      where: { messageId },
      data: { processed: true },
    });
  }

  async findUnprocessed(limit: number = 100): Promise<WhatsAppIncoming[]> {
    return this.prisma.whatsAppIncoming.findMany({
      where: { processed: false },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async exists(messageId: string): Promise<boolean> {
    const count = await this.prisma.whatsAppIncoming.count({
      where: { messageId },
    });
    return count > 0;
  }

  async deleteOldMessages(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.whatsAppIncoming.deleteMany({
      where: {
        processed: true,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
