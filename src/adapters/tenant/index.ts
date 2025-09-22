import type { Tenant } from '@prisma/client';
import { TenantResponse } from '@models/routes/tenant';

export function toTenantFullResponse(tenant: Tenant): TenantResponse {
  return {
    id: tenant.id,
    name: tenant.name,
    afipCuit: tenant.afipCuit,
    afipCondition: tenant.afipCondition,
    afipPv: tenant.afipPv,
    afipCertPath: tenant.afipCertPath,
    afipKeyPath: tenant.afipKeyPath,
  };
}
