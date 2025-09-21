import argon2 from 'argon2';
import { BaseService } from './BaseService';
import { TenantRepository } from '@repositories/TenantRepository';
import { UserRepository } from '@repositories/UserRepository';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '@shared/errors';
import type { User, Tenant } from '@prisma/client';

export interface SignupResult {
  user: User;
  tenant: Tenant;
}

export interface AuthenticatedUser {
  user: User;
  tenant: Tenant;
}

export class AuthService extends BaseService {
  private tenantRepo: TenantRepository;
  private userRepo: UserRepository;

  constructor() {
    super();
    this.tenantRepo = new TenantRepository(this.prisma);
    this.userRepo = new UserRepository(this.prisma);
  }

  async signup(data: {
    email?: string;
    password?: string;
    newTenantName?: string;
    existingTenantName?: string;
    whatsappNumber?: string;
  }): Promise<SignupResult> {
    const shouldCreateTenant = !!data.newTenantName;
    const tenantName = data.newTenantName || data.existingTenantName!;

    const existingTenant = await this.tenantRepo.findByName(tenantName);

    if (shouldCreateTenant && existingTenant) {
      throw new ConflictError(`Firma ${existingTenant.name} already exists`);
    }

    if (!shouldCreateTenant && !existingTenant) {
      throw new NotFoundError(
        `Firma ${tenantName} not found, you should create one`
      );
    }

    if (data.email) {
      const existingUser = await this.userRepo.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }
    }

    if (data.whatsappNumber) {
      const existingUser = await this.userRepo.findByWhatsApp(
        data.whatsappNumber
      );
      if (existingUser) {
        throw new ConflictError('WhatsApp number is already registered');
      }
    }

    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await argon2.hash(data.password);
    }

    return this.transaction(async (prisma) => {
      let tenant: Tenant;

      if (shouldCreateTenant) {
        tenant = await prisma.tenant.create({
          data: {
            name: tenantName,
          },
        });
      } else {
        tenant = existingTenant!;
      }

      const user = await prisma.user.create({
        data: {
          ...(data.email && { email: data.email }),
          ...(hashedPassword && { password: hashedPassword }),
          whatsappNumber: data.whatsappNumber || '',
          role: shouldCreateTenant ? 'ADMIN' : 'USER',
          tenantId: tenant.id,
        },
        include: {
          tenant: true,
        },
      });

      return { user, tenant };
    });
  }

  async signin(
    identifier: string,
    password: string
  ): Promise<AuthenticatedUser> {
    let user = await this.userRepo.findByEmail(identifier);

    if (!user) {
      user = await this.userRepo.findByWhatsApp(identifier);
    }

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (!user.password) {
      throw new AuthenticationError('User has no password configured');
    }

    const isValidPassword = await argon2.verify(user.password, password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    return {
      user: user as User,
      tenant: (user as unknown as AuthenticatedUser).tenant,
    };
  }

  async linkWhatsApp(userId: string, whatsappNumber: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const existingUser = await this.userRepo.findByWhatsAppAndTenant(
      whatsappNumber,
      user.tenantId
    );

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError('WhatsApp number already in use in this Firma');
    }

    return this.userRepo.linkWhatsApp(userId, whatsappNumber);
  }

  async getUserById(id: string): Promise<AuthenticatedUser> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    return {
      user: user as User,
      tenant: (user as unknown as AuthenticatedUser).tenant,
    };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    if (!user.password) {
      throw new AuthenticationError('User has no password configured');
    }

    const isValidPassword = await argon2.verify(user.password, oldPassword);
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const hashedNewPassword = await argon2.hash(newPassword);
    await this.userRepo.updatePassword(userId, hashedNewPassword);
  }
}
