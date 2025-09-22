import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import buildApp from '../../src/app';
import { AuthService } from '../../src/services';
import type { User, Tenant } from '@prisma/client';
import { mockUser, mockTenant } from '../mocks/auth.data';

describe('api/auth route', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('JWT Authentication', () => {
    it('should generate and verify JWT token correctly', async () => {
      const app = await buildApp();
      await app.ready();

      try {
        const payload = {
          userId: 'test-user-id',
          tenantId: 'test-tenant-id',
          email: 'test@example.com',
        };

        const token = app.generateToken(payload);
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);

        const response = await request(app.server)
          .get('/test-jwt')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe('JWT token is valid');
        expect(response.body.user.userId).toBe('test-user-id');
        expect(response.body.user.tenantId).toBe('test-tenant-id');
        expect(response.body.user.email).toBe('test@example.com');
        expect(response.body.user).toBeDefined();
        expect(response.body.user.iat).toBeDefined();
        expect(response.body.user.exp).toBeDefined();
      } finally {
        await app.close();
      }
    });

    it('should reject invalid token', async () => {
      const app = await buildApp();
      await app.ready();

      try {
        const response = await request(app.server)
          .get('/api/auth/profile')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);

        expect(response.body.error).toBe('Unauthorized');
      } finally {
        await app.close();
      }
    });

    it('should reject missing authorization header', async () => {
      const app = await buildApp();
      await app.ready();

      try {
        const response = await request(app.server)
          .get('/api/auth/profile')
          .expect(401);

        expect(response.body.error).toBe('Unauthorized');
      } finally {
        await app.close();
      }
    });
  });

  describe('/signup controller', () => {
    describe('Creating new user with new tenant', () => {
      it('should create new tenant and user successfully when newTenantName is provided', async () => {
        const app = await buildApp();
        await app.ready();

        const mockSignup = jest
          .fn<() => Promise<{ user: User; tenant: Tenant }>>()
          .mockResolvedValue({
            user: mockUser[0]!,
            tenant: mockTenant,
          });

        jest
          .spyOn(AuthService.prototype, 'signup')
          .mockImplementation(mockSignup);

        try {
          const response = await request(app.server)
            .post('/api/auth/signup')
            .send({
              email: 'test@example.com',
              password: 'SecurePass123!',
              newTenantName: 'Test Company',
              whatsappNumber: '+1234567890',
            })
            .expect(200);

          expect(response.body.message).toBe(
            'User and Firma created successfully'
          );
          expect(response.body.data.user.email).toBe('test@example.com');
          expect(response.body.data.tenant.name).toBe('Test Company');
          expect(response.body.data.token).toBeDefined();
          expect(mockSignup).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'SecurePass123!',
            newTenantName: 'Test Company',
            whatsappNumber: '+1234567890',
          });
        } finally {
          await app.close();
        }
      });

      it('should create new user and join existing tenant when existingTenantName is provided', async () => {
        const app = await buildApp();
        await app.ready();

        const mockSignup = jest
          .fn<() => Promise<{ user: User; tenant: Tenant }>>()
          .mockResolvedValue({
            user: mockUser[1]!,
            tenant: mockTenant,
          });

        jest
          .spyOn(AuthService.prototype, 'signup')
          .mockImplementation(mockSignup);

        try {
          const response = await request(app.server)
            .post('/api/auth/signup')
            .send({
              email: 'newuser@example.com',
              password: 'SecurePass123!',
              existingTenantName: 'Test Company',
              whatsappNumber: '+1234567891',
            })
            .expect(200);

          expect(response.body.data.tenant.name).toBe('Test Company');
          expect(mockSignup).toHaveBeenCalledWith({
            email: 'newuser@example.com',
            password: 'SecurePass123!',
            existingTenantName: 'Test Company',
            whatsappNumber: '+1234567891',
          });
        } finally {
          await app.close();
        }
      });

      it('should return validation error when neither newTenantName nor existingTenantName is provided', async () => {
        const app = await buildApp();
        await app.ready();

        try {
          const response = await request(app.server)
            .post('/api/auth/signup')
            .send({
              email: 'invalid-email',
              password: '123',
            })
            .expect(400);

          expect(response.body.error).toBe('Bad Request');
          expect(response.body.message).toContain(
            'Validation failed: email: Invalid email format, password: Password must be at least 8 characters, password: Password must contain at least one lowercase letter, password: Password must contain at least one uppercase letter, tenantName: Either newTenantName or existingTenantName must be provided, but not both'
          );
        } finally {
          await app.close();
        }
      });
    });
  });

  describe('/signin controller', () => {
    it('should signin successfully with email', async () => {
      const app = await buildApp();
      await app.ready();

      const mockSignin = jest
        .fn<() => Promise<{ user: User; tenant: Tenant }>>()
        .mockResolvedValue({
          user: mockUser[0]!,
          tenant: mockTenant,
        });

      jest
        .spyOn(AuthService.prototype, 'signin')
        .mockImplementation(mockSignin);

      try {
        const response = await request(app.server)
          .post('/api/auth/signin')
          .send({
            identifier: 'test@example.com',
            password: 'SecurePass123!',
          })
          .expect(200);

        expect(response.body.message).toBe('Login successful');
        expect(response.body.data.user.email).toBe('test@example.com');
        expect(response.body.data.token).toBeDefined();
        expect(mockSignin).toHaveBeenCalledWith(
          'test@example.com',
          'SecurePass123!'
        );
      } finally {
        await app.close();
      }
    });

    it('should signin successfully with WhatsApp number', async () => {
      const app = await buildApp();
      await app.ready();

      const mockSignin = jest
        .fn<() => Promise<{ user: User; tenant: Tenant }>>()
        .mockResolvedValue({
          user: mockUser[0]!,
          tenant: mockTenant,
        });

      jest
        .spyOn(AuthService.prototype, 'signin')
        .mockImplementation(mockSignin);

      try {
        const response = await request(app.server)
          .post('/api/auth/signin')
          .send({
            identifier: '+1234567890',
            password: 'SecurePass123!',
          })
          .expect(200);

        expect(response.body.data.user.whatsappNumber).toBe('+1234567890');
        expect(mockSignin).toHaveBeenCalledWith(
          '+1234567890',
          'SecurePass123!'
        );
      } finally {
        await app.close();
      }
    });

    it('should return error for invalid credentials', async () => {
      const app = await buildApp();
      await app.ready();

      const mockSignin = jest
        .fn<() => Promise<{ user: User; tenant: Tenant }>>()
        .mockRejectedValue({
          name: 'AuthenticationError',
          message: 'Invalid credentials',
          statusCode: 401,
        });

      jest
        .spyOn(AuthService.prototype, 'signin')
        .mockImplementation(mockSignin);

      try {
        await request(app.server)
          .post('/api/auth/signin')
          .send({
            identifier: 'nonexistent@example.com',
            password: 'wrongpassword',
          })
          .expect(401);
      } finally {
        await app.close();
      }
    });
  });

  describe('/profile controller', () => {
    it('should get user profile successfully', async () => {
      const app = await buildApp();
      await app.ready();

      const mockGetUserProfile = jest
        .fn<() => Promise<{ user: User; tenant: Tenant }>>()
        .mockResolvedValue({
          user: mockUser[0]!,
          tenant: mockTenant,
        });

      jest
        .spyOn(AuthService.prototype, 'getUserById')
        .mockImplementation(mockGetUserProfile);

      const token = app.generateToken({
        userId: 'user-123',
        tenantId: 'tenant-123',
        email: 'test@example.com',
      });

      try {
        const response = await request(app.server)
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.message).toBe('Profile retrieved successfully');
        expect(response.body.data.user.email).toBe('test@example.com');
        expect(mockGetUserProfile).toHaveBeenCalledWith('user-123');
      } finally {
        await app.close();
      }
    });

    it('should return 401 for missing token', async () => {
      const app = await buildApp();
      await app.ready();

      try {
        const response = await request(app.server)
          .get('/api/auth/profile')
          .expect(401);

        expect(response.body.error).toBe('Unauthorized');
      } finally {
        await app.close();
      }
    });
  });

  describe('/change-password controller', () => {
    it('should change password successfully', async () => {
      const app = await buildApp();
      await app.ready();

      const mockChangePassword = jest
        .fn<() => Promise<void>>()
        .mockResolvedValue();

      jest
        .spyOn(AuthService.prototype, 'changePassword')
        .mockImplementation(mockChangePassword);

      const token = app.generateToken({
        userId: 'user-123',
        tenantId: 'tenant-123',
        email: 'test@example.com',
      });

      try {
        const response = await request(app.server)
          .patch('/api/auth/change-password')
          .set('Authorization', `Bearer ${token}`)
          .send({
            currentPassword: 'OldPass123!',
            newPassword: 'NewSecurePass456!',
          })
          .expect(200);

        expect(response.body.message).toBe('Password updated successfully');
        expect(mockChangePassword).toHaveBeenCalledWith(
          'user-123',
          'OldPass123!',
          'NewSecurePass456!'
        );
      } finally {
        await app.close();
      }
    });

    it('should return validation error for weak password', async () => {
      const app = await buildApp();
      await app.ready();

      const token = app.generateToken({
        userId: 'user-123',
        tenantId: 'tenant-123',
        email: 'test@example.com',
      });

      try {
        const response = await request(app.server)
          .patch('/api/auth/change-password')
          .set('Authorization', `Bearer ${token}`)
          .send({
            currentPassword: 'weakpass',
            newPassword: 'NewSecurePass456!',
          })
          .expect(400);

        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toContain('Validation failed');
      } finally {
        await app.close();
      }
    });
  });
});
