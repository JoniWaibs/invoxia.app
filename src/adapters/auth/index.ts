import type { User, Tenant } from '@prisma/client';
import { UserResponse } from '@models/routes/auth';
import { TenantResponse } from '@models/routes/tenant';

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email || 'unknown',
    whatsappNumber: user.whatsappNumber,
    tenantId: user.tenantId,
  };
}

export function toBasicTenantResponse(tenant: Tenant): TenantResponse {
  return {
    id: tenant.id,
    name: tenant.name,
  };
}
