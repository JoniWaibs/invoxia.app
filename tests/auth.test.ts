process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

import { describe, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import buildApp from '../src/app';

describe('JWT Authentication', () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalExpires = process.env.JWT_EXPIRES_IN;

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
    process.env.JWT_EXPIRES_IN = originalExpires;
  });

  it('should generate and verify JWT token correctly', async () => {
    const app = await buildApp();
    await app.ready();

    try {
      // Test token generation
      const payload = {
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
        email: 'test@example.com',
      };

      const token = app.generateToken(payload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      const response = await request(app.server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(404); // Expect 404 because user doesn't exist in DB, but auth should work

      expect(response.body.error).toBe('Not Found');
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

  it('should extract user data from JWT token in request.user', async () => {
    const app = await buildApp();

    app.get(
      '/test-jwt',
      {
        preHandler: [app.authenticate],
      },
      async (request, reply) => {
        return reply.send({
          message: 'JWT data extracted successfully',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          user: (request as any).user,
        });
      }
    );

    await app.ready();

    try {
      const payload = {
        userId: 'test-user-123',
        tenantId: 'test-tenant-456',
        email: 'user@test.com',
      };

      const token = app.generateToken(payload);

      const response = await request(app.server)
        .get('/test-jwt')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('JWT data extracted successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.userId).toBe('test-user-123');
      expect(response.body.user.tenantId).toBe('test-tenant-456');
      expect(response.body.user.email).toBe('user@test.com');
      expect(response.body.user.iat).toBeDefined();
      expect(response.body.user.exp).toBeDefined();
    } finally {
      await app.close();
    }
  });
});
