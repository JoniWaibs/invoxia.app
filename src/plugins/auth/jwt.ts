import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { UnauthorizedError } from '@shared/errors';
import type { PluginConfig } from '@models/plugins';

export interface JWTPayload {
  userId: string;
  tenantId: string;
  email?: string;
  role: 'ADMIN' | 'USER';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: JWTPayload;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

async function jwtBasePlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyJwt, {
    secret: JWT_SECRET!,
    sign: {
      expiresIn: JWT_EXPIRES_IN,
    },
  });
}

async function jwtAuthPlugin(fastify: FastifyInstance) {
  fastify.decorate(
    'generateToken',
    (payload: Pick<JWTPayload, 'userId' | 'tenantId' | 'email'>): string => {
      return fastify.jwt.sign(payload);
    }
  );

  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, _reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        request.log.error(`JWT verification failed: ${err}`);
        throw new UnauthorizedError('Invalid or expired token');
      }
    }
  );
}

export const jwtPlugin: PluginConfig = {
  name: 'jwt',
  plugin: fp(jwtBasePlugin),
  enabled: true,
  environments: ['development', 'production', 'test'],
};

export const authPlugin: PluginConfig = {
  name: 'auth',
  plugin: fp(jwtAuthPlugin),
  enabled: true,
  environments: ['development', 'production', 'test'],
};
