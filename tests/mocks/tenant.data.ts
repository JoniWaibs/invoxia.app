import type { Tenant } from '@prisma/client';

export const mockTenant: Tenant = {
  id: 'tenant-123',
  name: 'Test Company',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  afipCuit: '20-12345678-9',
  afipPv: 1,
  afipCondition: 'RESPONSABLE_INSCRIPTO',
  afipCertPath: '/path/to/cert.crt',
  afipKeyPath: '/path/to/key.key',
};

export const mockUpdatedTenant: Tenant = {
  ...mockTenant,
  name: 'Updated Company',
  afipCuit: '20-98765432-1',
  afipPv: 2,
  afipCondition: 'MONOTRIBUTO',
  updatedAt: new Date('2024-01-02'),
};

export const validCredentialsRequest = {
  certPath: '/dev/certificates/cert.crt',
  keyPath: '/dev/certificates/key.key',
};

export const validUpdateRequest = {
  name: 'Updated Company',
  afipCuit: '20-98765432-1',
  afipCondition: 'MONOTRIBUTO' as const,
  afipPv: 2,
};

export const invalidCredentialsRequest = {
  certPath: '',
  keyPath: '',
};

export const invalidUpdateRequest = {
  name: 'Test Company',
  afipCuit: '12345',
};
