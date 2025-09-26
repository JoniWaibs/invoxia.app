import { Contact, DocumentType, AFIPCondition, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export interface CreateContactData {
  tenantId: string;
  fullName: string;
  docType: DocumentType;
  docNumber: string;
  email?: string | null;
  whatsapp?: string | null;
  ivaCondition?: AFIPCondition | null;
  address?: string | null;
}

export interface UpdateContactData {
  fullName?: string;
  docType?: DocumentType;
  docNumber?: string;
  email?: string | null;
  whatsapp?: string | null;
  ivaCondition?: AFIPCondition | null;
  address?: string | null;
}

export interface ContactFilters {
  tenantId: string;
  search?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface ContactListResult {
  contacts: Contact[];
  total: number;
}

export class ContactRepository extends BaseRepository {
  async create(data: CreateContactData): Promise<Contact> {
    return this.prisma.contact.create({
      data,
    });
  }

  async findById(id: string, tenantId: string): Promise<Contact | null> {
    return this.prisma.contact.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  async findByDocument(
    tenantId: string,
    docType: DocumentType,
    docNumber: string
  ): Promise<Contact | null> {
    return this.prisma.contact.findFirst({
      where: {
        tenantId,
        docType,
        docNumber,
      },
    });
  }

  async findMany(filters: ContactFilters): Promise<ContactListResult> {
    const { tenantId, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const whereClause = {
      tenantId,
      ...(search && {
        OR: [
          {
            fullName: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            docNumber: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where: whereClause,
        orderBy: {
          fullName: 'asc',
        },
        skip,
        take: limit,
      }),
      this.prisma.contact.count({
        where: whereClause,
      }),
    ]);

    return { contacts, total };
  }

  async update(
    id: string,
    tenantId: string,
    data: UpdateContactData
  ): Promise<Contact | null> {
    try {
      return await this.prisma.contact.update({
        where: {
          id,
          tenantId,
        },
        data,
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    try {
      await this.prisma.contact.delete({
        where: {
          id,
          tenantId,
        },
      });
      return true;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Counts total contacts for a tenant
   * @param tenantId Tenant ID
   * @returns Total contact count
   */
  async countByTenant(tenantId: string): Promise<number> {
    return this.prisma.contact.count({
      where: { tenantId },
    });
  }
}
