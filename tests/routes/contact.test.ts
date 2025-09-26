import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import type { FastifyInstance } from 'fastify';
import buildApp from '../../src/app';
import { ContactService } from '../../src/services';
import type {
  ContactResponse,
  ContactListResponse,
} from '@models/routes/contact';
import {
  mockContact,
  mockUpdatedContact,
  validCreateContactRequest,
  validUpdateContactRequest,
  invalidCreateContactRequest,
} from '../mocks/contact.data';

describe('api/contacts route', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  const generateTestToken = (app: FastifyInstance) => {
    return app.generateToken({
      userId: 'user-123',
      tenantId: 'tenant-123',
      email: 'test@example.com',
    });
  };

  describe('POST /api/contacts', () => {
    it('should create a contact successfully', async () => {
      const app = await buildApp();
      await app.ready();

      const mockCreateContact = jest
        .fn<() => Promise<ContactResponse>>()
        .mockResolvedValue({
          id: mockContact.id,
          fullName: mockContact.fullName,
          docType: mockContact.docType,
          docNumber: mockContact.docNumber,
          email: mockContact.email!,
          whatsapp: mockContact.whatsapp!,
          ivaCondition: mockContact.ivaCondition!,
          address: mockContact.address!,
          createdAt: mockContact.createdAt.toISOString(),
          updatedAt: mockContact.updatedAt.toISOString(),
        });

      jest
        .spyOn(ContactService.prototype, 'createContact')
        .mockImplementation(mockCreateContact);

      const token = generateTestToken(app);

      try {
        const response = await request(app.server)
          .post('/api/contacts')
          .set('Authorization', `Bearer ${token}`)
          .send(validCreateContactRequest)
          .expect(201);

        expect(response.body.message).toBe('Contact created successfully');
        expect(response.body.data.fullName).toBe('Juan Pérez');
        expect(response.body.data.docType).toBe('DNI');
        expect(response.body.data.docNumber).toBe('12345678');
        expect(mockCreateContact).toHaveBeenCalledWith(
          'tenant-123',
          validCreateContactRequest
        );
      } finally {
        await app.close();
      }
    });

    it('should return validation error for invalid contact data', async () => {
      const app = await buildApp();
      await app.ready();

      const token = generateTestToken(app);

      try {
        const response = await request(app.server)
          .post('/api/contacts')
          .set('Authorization', `Bearer ${token}`)
          .send(invalidCreateContactRequest)
          .expect(400);

        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toContain('Validation failed');
      } finally {
        await app.close();
      }
    });
  });

  describe('GET /api/contacts', () => {
    it('should list contacts with search and pagination', async () => {
      const app = await buildApp();
      await app.ready();

      const mockGetContacts = jest
        .fn<() => Promise<ContactListResponse>>()
        .mockResolvedValue({
          contacts: [
            {
              id: mockContact.id,
              fullName: mockContact.fullName,
              docType: mockContact.docType,
              docNumber: mockContact.docNumber,
              email: mockContact.email!,
              whatsapp: mockContact.whatsapp!,
              ivaCondition: mockContact.ivaCondition!,
              address: mockContact.address!,
              createdAt: mockContact.createdAt.toISOString(),
              updatedAt: mockContact.updatedAt.toISOString(),
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
        });

      jest
        .spyOn(ContactService.prototype, 'getContacts')
        .mockImplementation(mockGetContacts);

      const token = generateTestToken(app);

      try {
        const response = await request(app.server)
          .get('/api/contacts?q=Juan&page=1&limit=20')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe('Contacts retrieved successfully');
        expect(response.body.data.contacts).toHaveLength(1);
        expect(response.body.data.total).toBe(1);
        expect(response.body.data.page).toBe(1);
        expect(response.body.data.limit).toBe(20);
        expect(mockGetContacts).toHaveBeenCalledWith('tenant-123', {
          q: 'Juan',
          page: 1,
          limit: 20,
        });
      } finally {
        await app.close();
      }
    });

    it('should return 401 for missing authentication', async () => {
      const app = await buildApp();
      await app.ready();

      try {
        const response = await request(app.server)
          .get('/api/contacts')
          .expect(401);

        expect(response.body.error).toBe('Unauthorized');
      } finally {
        await app.close();
      }
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('should get contact by id successfully', async () => {
      const app = await buildApp();
      await app.ready();

      const mockGetContactById = jest
        .fn<() => Promise<ContactResponse>>()
        .mockResolvedValue({
          id: mockContact.id,
          fullName: mockContact.fullName,
          docType: mockContact.docType,
          docNumber: mockContact.docNumber,
          email: mockContact.email!,
          whatsapp: mockContact.whatsapp!,
          ivaCondition: mockContact.ivaCondition!,
          address: mockContact.address!,
          createdAt: mockContact.createdAt.toISOString(),
          updatedAt: mockContact.updatedAt.toISOString(),
        });

      jest
        .spyOn(ContactService.prototype, 'getContactById')
        .mockImplementation(mockGetContactById);

      const token = generateTestToken(app);

      try {
        const response = await request(app.server)
          .get('/api/contacts/contact-123')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe('Contact retrieved successfully');
        expect(response.body.data.id).toBe('contact-123');
        expect(response.body.data.fullName).toBe('Juan Pérez');
        expect(mockGetContactById).toHaveBeenCalledWith(
          'contact-123',
          'tenant-123'
        );
      } finally {
        await app.close();
      }
    });

    it('should return 404 for non-existent contact', async () => {
      const app = await buildApp();
      await app.ready();

      const mockGetContactById = jest
        .fn<() => Promise<ContactResponse>>()
        .mockRejectedValue({
          name: 'NotFoundError',
          message: 'Contact not found',
          statusCode: 404,
        });

      jest
        .spyOn(ContactService.prototype, 'getContactById')
        .mockImplementation(mockGetContactById);

      const token = generateTestToken(app);

      try {
        await request(app.server)
          .get('/api/contacts/non-existent-id')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      } finally {
        await app.close();
      }
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('should update contact successfully', async () => {
      const app = await buildApp();
      await app.ready();

      const mockUpdateContact = jest
        .fn<() => Promise<ContactResponse>>()
        .mockResolvedValue({
          id: mockUpdatedContact.id,
          fullName: mockUpdatedContact.fullName,
          docType: mockUpdatedContact.docType,
          docNumber: mockUpdatedContact.docNumber,
          email: mockUpdatedContact.email!,
          whatsapp: mockUpdatedContact.whatsapp!,
          ivaCondition: mockUpdatedContact.ivaCondition!,
          address: mockUpdatedContact.address!,
          createdAt: mockUpdatedContact.createdAt.toISOString(),
          updatedAt: mockUpdatedContact.updatedAt.toISOString(),
        });

      jest
        .spyOn(ContactService.prototype, 'updateContact')
        .mockImplementation(mockUpdateContact);

      const token = generateTestToken(app);

      try {
        const response = await request(app.server)
          .put('/api/contacts/contact-123')
          .set('Authorization', `Bearer ${token}`)
          .send(validUpdateContactRequest)
          .expect(200);

        expect(response.body.message).toBe('Contact updated successfully');
        expect(response.body.data.fullName).toBe('Juan Carlos Pérez');
        expect(response.body.data.email).toBe('juan.carlos@newmail.com');
        expect(mockUpdateContact).toHaveBeenCalledWith(
          'contact-123',
          'tenant-123',
          validUpdateContactRequest
        );
      } finally {
        await app.close();
      }
    });

    it('should return 409 for document conflict', async () => {
      const app = await buildApp();
      await app.ready();

      const mockUpdateContact = jest
        .fn<() => Promise<ContactResponse>>()
        .mockRejectedValue({
          name: 'ConflictError',
          message: 'Contact with DNI 98765432 already exists',
          statusCode: 409,
        });

      jest
        .spyOn(ContactService.prototype, 'updateContact')
        .mockImplementation(mockUpdateContact);

      const token = generateTestToken(app);

      try {
        await request(app.server)
          .put('/api/contacts/contact-123')
          .set('Authorization', `Bearer ${token}`)
          .send({ docNumber: '98765432' })
          .expect(409);
      } finally {
        await app.close();
      }
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete contact successfully', async () => {
      const app = await buildApp();
      await app.ready();

      const mockDeleteContact = jest
        .fn<() => Promise<void>>()
        .mockResolvedValue();

      jest
        .spyOn(ContactService.prototype, 'deleteContact')
        .mockImplementation(mockDeleteContact);

      const token = generateTestToken(app);

      try {
        const response = await request(app.server)
          .delete('/api/contacts/contact-123')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe('Contact deleted successfully');
        expect(mockDeleteContact).toHaveBeenCalledWith(
          'contact-123',
          'tenant-123'
        );
      } finally {
        await app.close();
      }
    });

    it('should return 404 for non-existent contact deletion', async () => {
      const app = await buildApp();
      await app.ready();

      const mockDeleteContact = jest
        .fn<() => Promise<void>>()
        .mockRejectedValue({
          name: 'NotFoundError',
          message: 'Contact not found',
          statusCode: 404,
        });

      jest
        .spyOn(ContactService.prototype, 'deleteContact')
        .mockImplementation(mockDeleteContact);

      const token = generateTestToken(app);

      try {
        await request(app.server)
          .delete('/api/contacts/non-existent-id')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      } finally {
        await app.close();
      }
    });
  });
});
