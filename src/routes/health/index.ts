import type { FastifyInstance } from 'fastify';

async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    request.log.info('Health check endpoint running OK');

    return reply.send({
      status: 'ok',
      message: 'Invoxia API - MVP Facturador Multi-Tenant',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
}

export default healthRoutes;
