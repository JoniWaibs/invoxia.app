import type { Tenant, AFIPCondition } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export class TenantRepository extends BaseRepository {
  async create(data: {
    name: string;
    afipCuit?: string;
    afipPv?: number;
    afipCondition?: AFIPCondition;
  }): Promise<Tenant> {
    return this.prisma.tenant.create({
      data,
    });
  }

  async findById(
    id: string,
    includeRelations: boolean = false
  ): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { id },
      ...(includeRelations && {
        include: {
          users: true,
          _count: {
            select: {
              users: true,
              waSessions: true,
            },
          },
        },
      }),
    });
  }

  async findByName(name: string): Promise<Tenant | null> {
    return this.prisma.tenant.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async findByUser(userId: string): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      afipCuit: string;
      afipPv: number;
      afipCondition: AFIPCondition;
      afipCertPath: string;
      afipKeyPath: string;
    }>
  ): Promise<Tenant> {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tenant.delete({
      where: { id },
    });
  }

  async isAfipConfigured(id: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: {
        afipCuit: true,
        afipPv: true,
        afipCondition: true,
        afipCertPath: true,
        afipKeyPath: true,
      },
    });

    if (!tenant) return false;

    return !!(
      tenant.afipCuit &&
      tenant.afipPv &&
      tenant.afipCondition &&
      tenant.afipCertPath &&
      tenant.afipKeyPath
    );
  }
}
