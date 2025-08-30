import Fastify from 'fastify';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerAllPlugins } from './plugins';

const buildApp = async (): Promise<FastifyInstance> => {
  const fastify = Fastify({
    logger: true,
  });

  await registerAllPlugins(fastify);

  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    request.log.info('Root endpoint accessed');
    return reply.send({ message: 'Hello, Fastify with TypeScript!' });
  });

  return fastify;
};

export default buildApp;
