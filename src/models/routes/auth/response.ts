import { Tenant } from '@models/routes/tenant';

export interface User {
  id: string;
  email?: string;
  whatsappNumber: string;
  tenantId: Tenant['id'];
}

export interface Auth {
  user: User;
  tenant: Tenant;
  token: string;
}

export interface Profile {
  user: Omit<User, 'tenantId'>;
  tenant: Pick<Tenant, 'id' | 'name'>;
}
