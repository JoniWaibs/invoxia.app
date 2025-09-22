import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import buildApp from '../../src/app';
import { TenantService } from '../../src/services/TenantService';
import {
  mockTenant,
  mockUpdatedTenant,
  validCredentialsRequest,
  validUpdateRequest,
  invalidCredentialsRequest,
} from '../mocks/tenant.data';
import type {
  TenantCredentialsResponse,
  TenantResponse,
  UpdateTenantResponse,
} from '../../src/models/routes/tenant';

describe('api/tenant route', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /tenant', () => {
    it('should get tenant settings successfully', async () => {
      const app = await buildApp();
      await app.ready();

      const mockGetTenantSettings = jest
        .fn<() => Promise<TenantResponse>>()
        .mockResolvedValue(mockTenant);

      jest
        .spyOn(TenantService.prototype, 'getTenantSettings')
        .mockImplementation(mockGetTenantSettings);

      const token = app.generateToken({
        userId: 'user-123',
        tenantId: 'tenant-123',
        email: 'test@example.com',
      });

      try {
        const response = await request(app.server)
          .get('/api/tenant')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe(
          'Tenant settings retrieved successfully'
        );
        expect(response.body.data.id).toBe('tenant-123');
        expect(response.body.data.name).toBe('Test Company');
        expect(mockGetTenantSettings).toHaveBeenCalledWith('tenant-123');
      } finally {
        await app.close();
      }
    });

    it('should return 401 for missing token', async () => {
      const app = await buildApp();
      await app.ready();

      try {
        const response = await request(app.server)
          .get('/api/tenant')
          .expect(401);

        expect(response.body.error).toBe('Unauthorized');
      } finally {
        await app.close();
      }
    });
  });

  describe('POST /tenant/credentials', () => {
    it('should update credentials successfully', async () => {
      const app = await buildApp();
      await app.ready();

      const mockUpdateCredentials = jest
        .fn<() => Promise<TenantCredentialsResponse>>()
        .mockResolvedValue({
          certPath: validCredentialsRequest.certPath,
          keyPath: validCredentialsRequest.keyPath,
        });

      jest
        .spyOn(TenantService.prototype, 'updateCredentials')
        .mockImplementation(mockUpdateCredentials);

      const token = app.generateToken({
        userId: 'user-123',
        tenantId: 'tenant-123',
        email: 'test@example.com',
      });

      try {
        const response = await request(app.server)
          .post('/api/tenant/credentials')
          .set('Authorization', `Bearer ${token}`)
          .send(validCredentialsRequest)
          .expect(200);

        expect(response.body.message).toBe('Credentials updated successfully');
        expect(response.body.data.certPath).toBe(
          validCredentialsRequest.certPath
        );
        expect(response.body.data.keyPath).toBe(
          validCredentialsRequest.keyPath
        );
        expect(mockUpdateCredentials).toHaveBeenCalledWith(
          'tenant-123',
          validCredentialsRequest
        );
      } finally {
        await app.close();
      }
    });

    it('should return validation error for invalid file paths', async () => {
      const app = await buildApp();
      await app.ready();

      const token = app.generateToken({
        userId: 'user-123',
        tenantId: 'tenant-123',
        email: 'test@example.com',
      });

      try {
        const response = await request(app.server)
          .post('/api/tenant/credentials')
          .set('Authorization', `Bearer ${token}`)
          .send(invalidCredentialsRequest)
          .expect(400);

        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toContain('Validation failed');
      } finally {
        await app.close();
      }
    });
  });

  describe('PUT /tenant/:id', () => {
    it('should update tenant configuration successfully', async () => {
      const app = await buildApp();
      await app.ready();

      const mockUpdateTenantConfig = jest
        .fn<() => Promise<UpdateTenantResponse>>()
        .mockResolvedValue(mockUpdatedTenant);

      jest
        .spyOn(TenantService.prototype, 'updateTenantConfig')
        .mockImplementation(mockUpdateTenantConfig);

      const token = app.generateToken({
        userId: 'user-123',
        tenantId: 'tenant-123',
        email: 'test@example.com',
      });

      try {
        const response = await request(app.server)
          .put('/api/tenant/tenant-123')
          .set('Authorization', `Bearer ${token}`)
          .send(validUpdateRequest)
          .expect(200);
        console.log(response.body.data);
        expect(response.body.message).toBe('Tenant updated successfully');
        expect(response.body.data.name).toBe('Updated Company');
        expect(response.body.data.afipCuit).toBe('20-98765432-1');
        expect(mockUpdateTenantConfig).toHaveBeenCalledWith(
          'tenant-123',
          validUpdateRequest
        );
      } finally {
        await app.close();
      }
    });

    it('should return 403 when trying to update different tenant', async () => {
      const app = await buildApp();
      await app.ready();

      const token = app.generateToken({
        userId: 'user-123',
        tenantId: 'tenant-123',
        email: 'test@example.com',
      });

      try {
        await request(app.server)
          .put('/api/tenant/different-tenant-456')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'New Name' })
          .expect(403);
      } finally {
        await app.close();
      }
    });
  });
});
