import type { Contact } from '@prisma/client';

export const mockContact: Contact = {
  id: 'contact-123',
  tenantId: 'tenant-123',
  fullName: 'Juan Pérez',
  docType: 'DNI',
  docNumber: '12345678',
  email: 'juan.perez@example.com',
  whatsapp: '+5491123456789',
  ivaCondition: 'RESPONSABLE_INSCRIPTO',
  address: 'Av. Corrientes 1234, CABA',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockContact2: Contact = {
  id: 'contact-456',
  tenantId: 'tenant-123',
  fullName: 'María García',
  docType: 'CUIT',
  docNumber: '20123456789',
  email: 'maria.garcia@company.com',
  whatsapp: '+5491198765432',
  ivaCondition: 'MONOTRIBUTO',
  address: 'San Martín 567, Buenos Aires',
  createdAt: new Date('2024-01-02'),
  updatedAt: new Date('2024-01-02'),
};

export const mockUpdatedContact: Contact = {
  ...mockContact,
  fullName: 'Juan Carlos Pérez',
  email: 'juan.carlos@newmail.com',
  updatedAt: new Date('2024-01-03'),
};

export const validCreateContactRequest = {
  fullName: 'Juan Pérez',
  docType: 'DNI' as const,
  docNumber: '12345678',
  email: 'juan.perez@example.com',
  whatsapp: '+5491123456789',
  ivaCondition: 'RESPONSABLE_INSCRIPTO' as const,
  address: 'Av. Corrientes 1234, CABA',
};

export const validUpdateContactRequest = {
  fullName: 'Juan Carlos Pérez',
  email: 'juan.carlos@newmail.com',
};

export const invalidCreateContactRequest = {
  fullName: 'A', // Too short
  docType: 'INVALID' as 'DNI',
  docNumber: '123', // Too short
  email: 'invalid-email',
};

export const conflictCreateContactRequest = {
  fullName: 'Another Person',
  docType: 'DNI' as const,
  docNumber: '12345678', // Same as mockContact
  email: 'different@email.com',
};

export const mockContactListResult = {
  contacts: [mockContact, mockContact2],
  total: 2,
};

export const mockSearchQuery = {
  q: 'Juan',
  page: 1,
  limit: 20,
};
