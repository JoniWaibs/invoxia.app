import { BaseService } from './BaseService';
import { TenantRepository } from '@repositories/TenantRepository';
import { NotFoundError, ValidationError } from '@shared/errors';
import type {
  TenantResponse,
  UpdateTenantRequest,
  TenantCredentialsRequest,
} from '@models/routes/tenant';
import { toTenantFullResponse } from '@adapters/tenant';

export class TenantService extends BaseService {
  private tenantRepo: TenantRepository;

  constructor() {
    super();
    this.tenantRepo = new TenantRepository();
  }

  async getTenantSettings(tenantId: string): Promise<TenantResponse> {
    const tenant = await this.tenantRepo.findById(tenantId, false);

    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    return toTenantFullResponse(tenant);
  }

  async updateCredentials(
    tenantId: string,
    data: TenantCredentialsRequest
  ): Promise<{ certPath: string; keyPath: string }> {
    const tenant = await this.tenantRepo.findById(tenantId, false);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    this.validateFilePaths(data.certPath, data.keyPath);

    await this.tenantRepo.update(tenantId, {
      afipCertPath: data.certPath,
      afipKeyPath: data.keyPath,
    });

    return {
      certPath: data.certPath,
      keyPath: data.keyPath,
    };
  }

  async updateTenantConfig(
    tenantId: string,
    data: UpdateTenantRequest
  ): Promise<TenantResponse> {
    const existingTenant = await this.tenantRepo.findById(tenantId, false);
    if (!existingTenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    if (data.afipCuit) {
      this.validateCuit(data.afipCuit);
    }

    if (data.name && data.name !== existingTenant.name) {
      const conflictingTenant = await this.tenantRepo.findByName(data.name);
      if (conflictingTenant && conflictingTenant.id !== tenantId) {
        throw new ValidationError(`Tenant name ${data.name} is already in use`);
      }
    }

    const updatedTenant = await this.tenantRepo.update(tenantId, {
      ...(data.name && { name: data.name }),
      ...(data.afipCuit && { afipCuit: data.afipCuit }),
      ...(data.afipCondition && { afipCondition: data.afipCondition }),
      ...(data.afipPv && { afipPv: data.afipPv }),
    });

    return toTenantFullResponse(updatedTenant);
  }

  private validateCuit(cuit: string): void {
    // Remove any non-numeric characters
    const cleanCuit = cuit.replace(/\D/g, '');

    if (cleanCuit.length !== 11) {
      throw new ValidationError('CUIT must be 11 digits long');
    }

    // Basic CUIT validation algorithm
    const digits = cleanCuit.split('').map(Number);
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i]! * multipliers[i]!;
    }

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;

    if (checkDigit !== digits[10]!) {
      throw new ValidationError('Invalid CUIT check digit');
    }
  }

  private validateFilePaths(certPath: string, keyPath: string): void {
    if (!certPath.endsWith('.crt') && !certPath.endsWith('.pem')) {
      throw new ValidationError(
        'Certificate file must have .crt or .pem extension'
      );
    }

    if (!keyPath.endsWith('.key') && !keyPath.endsWith('.pem')) {
      throw new ValidationError('Key file must have .key or .pem extension');
    }

    if (certPath === keyPath) {
      throw new ValidationError('Certificate and key paths must be different');
    }
  }

  async isAfipConfigured(tenantId: string): Promise<boolean> {
    return this.tenantRepo.isAfipConfigured(tenantId);
  }
}
