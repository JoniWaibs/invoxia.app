import Fastify from 'fastify';
import dotenv from 'dotenv';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { registerAllPlugins } from '@plugins/utils';
import authRoutes from '@routes/auth';
import contactRoutes from '@routes/contact';
import healthRoutes from '@routes/health';
import tenantRoutes from '@routes/tenant';

dotenv.config();

const appRoutes = [
  {
    prefix: '/api/auth',
    route: authRoutes,
  },
  {
    prefix: '/api/contacts',
    route: contactRoutes,
  },
  {
    prefix: '/api/health',
    route: healthRoutes,
  },
  {
    prefix: '/api/tenant',
    route: tenantRoutes,
  },
];

const buildApp = async (): Promise<FastifyInstance> => {
  const fastify = Fastify({
    logger: true,
  });

  await registerAllPlugins(fastify);

  // For tests purpose
  fastify.get(
    '/test-jwt',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      return reply.send({
        message: 'JWT token is valid',
        user: request.user,
      });
    }
  );

  appRoutes.forEach((route: { prefix: string; route: FastifyPluginAsync }) => {
    fastify.register(route.route, { prefix: route.prefix });
  });

  return fastify;
};

export default buildApp;
