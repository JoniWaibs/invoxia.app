import type { JWTPayload } from '../src/plugins/auth/jwt';

declare module 'fastify' {
    interface FastifyInstance {
      authenticate: (
        request: FastifyRequest,
        reply: FastifyReply
      ) => Promise<void>;
      generateToken: (
        payload: Pick<JWTPayload, 'userId' | 'tenantId' | 'email'>
      ) => string;
    }
  }