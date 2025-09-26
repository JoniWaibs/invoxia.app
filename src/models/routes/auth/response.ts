import { TenantResponse } from '@models/routes/tenant';

export interface UserResponse {
  id: string;
  email?: string | null;
  whatsappNumber: string;
  tenantId: string;
}

export interface AuthResponse {
  user: UserResponse;
  tenant: Pick<TenantResponse, 'id' | 'name'>;
}
