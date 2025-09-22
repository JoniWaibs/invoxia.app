import { z } from 'zod';
import {
  updateTenantSchema,
  tenantCredentialsSchema,
} from '@shared/validations/tenant';

export type UpdateTenantRequest = z.infer<typeof updateTenantSchema>;

export type TenantCredentialsRequest = z.infer<typeof tenantCredentialsSchema>;
