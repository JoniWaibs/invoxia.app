import type { User, Tenant } from '@prisma/client';

export const mockTenant: Tenant = {
  id: 'tenant-123',
  name: 'Test Company',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  afipCuit: null,
  afipPv: null,
  afipCondition: null,
  afipCertPath: null,
  afipKeyPath: null,
};

export const mockUser: Array<User> = [
  {
    id: 'user-123',
    email: 'test@example.com',
    password: '$argon2id$v=19$m=65536,t=3,p=4$hash',
    whatsappNumber: '+1234567890',
    role: 'ADMIN',
    tenantId: 'tenant-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user-456',
    email: 'newuser@example.com',
    password: '$argon2id$v=19$m=65536,t=3,p=4$hash',
    whatsappNumber: '+1234567891',
    role: 'USER',
    tenantId: 'tenant-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];
