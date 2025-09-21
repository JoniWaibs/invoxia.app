import Fastify from 'fastify';
import dotenv from 'dotenv';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { registerAllPlugins } from '@plugins/utils';
import authRoutes from '@routes/auth';
import healthRoutes from '@routes/health';

dotenv.config();

const appRoutes = [
  {
    prefix: '/api/auth',
    route: authRoutes,
  },
  {
    prefix: '/api/health',
    route: healthRoutes,
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
