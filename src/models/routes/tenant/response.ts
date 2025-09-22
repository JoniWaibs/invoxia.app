export interface TenantResponse {
  id: string;
  name: string;
  afipCuit?: string | null;
  afipCondition?: string | null;
  afipPv?: number | null;
  afipCertPath?: string | null;
  afipKeyPath?: string | null;
}

export interface TenantCredentialsResponse {
  certPath: string;
  keyPath: string;
}

export type UpdateTenantResponse = TenantResponse;
