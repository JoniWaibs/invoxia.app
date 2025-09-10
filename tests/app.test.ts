process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

import { describe, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import buildApp from '../src/app';

describe('App', () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalExpires = process.env.JWT_EXPIRES_IN;

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
    process.env.JWT_EXPIRES_IN = originalExpires;
  });

  it('should return a greeting message', async () => {
    const app = await buildApp();
    await app.ready();

    try {
      const response = await request(app.server).get('/api/health').expect(200);

      expect(response.body).toMatchObject({
        message: 'Invoxia API - MVP Facturador Multi-Tenant',
        status: 'ok',
      });
    } finally {
      await app.close();
    }
  });
});
