import type { User, UserRole } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository {
  async create(data: {
    email?: string;
    password?: string;
    whatsappNumber: string;
    role: UserRole;
    tenantId: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
      include: {
        tenant: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        tenant: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    });
  }

  async findByWhatsApp(
    whatsappNumber: string,
    tenantId?: string
  ): Promise<User | null> {
    if (tenantId) {
      return this.prisma.user.findFirst({
        where: {
          whatsappNumber,
          tenantId,
        },
        include: {
          tenant: true,
        },
      });
    }

    // Find user across all tenants
    return this.prisma.user.findFirst({
      where: {
        whatsappNumber,
      },
      include: {
        tenant: true,
      },
    });
  }

  async findByWhatsAppAndTenant(
    whatsappNumber: string,
    tenantId: string
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        whatsappNumber,
        tenantId,
      },
      include: {
        tenant: true,
      },
    });
  }

  // Find all tenants that a WhatsApp number belongs to
  async findTenantsByWhatsApp(whatsappNumber: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        whatsappNumber,
      },
      include: {
        tenant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      email: string;
      password: string;
      whatsappNumber: string;
      role: UserRole;
    }>
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        tenant: true,
      },
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      include: {
        tenant: true,
      },
    });
  }

  async linkWhatsApp(userId: string, whatsappNumber: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { whatsappNumber },
      include: {
        tenant: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
