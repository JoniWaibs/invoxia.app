import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import buildApp from '../src/app';

describe('App', () => {
  it('should return a greeting message', async () => {
    const app = await buildApp();
    await app.ready();

    try {
      const response = await request(app.server).get('/').expect(200);

      expect(response.body).toEqual({
        message: 'Hello, Fastify with TypeScript!',
      });
    } finally {
      await app.close();
    }
  });
});
