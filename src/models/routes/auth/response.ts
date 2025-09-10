import { Tenant } from '@models/routes/tenant';

export interface User {
  id: string;
  email?: string;
  whatsappNumber: string;
  tenantId: string;
}

export interface Auth {
  user: User;
  tenant: Tenant;
  token: string;
}

export interface Profile {
  user: User;
  tenant: Tenant;
}
