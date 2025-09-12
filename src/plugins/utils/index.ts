import type { FastifyInstance } from 'fastify';
import { PluginRegister } from '@plugins/registry';
import { securityPlugins } from '@plugins/security';
import { middlewarePlugins } from '@plugins/middleware';
import { jwtPlugin, authPlugin } from '@plugins/auth/jwt';
import type { PluginRegistrationResult } from '@models/plugins';

export const allPlugins = [
  jwtPlugin,
  authPlugin,
  ...middlewarePlugins,
  ...securityPlugins,
  // Add more plugin categories here as you expand:
  // ...validationPlugins,
  // ...rateLimitPlugins,
  // ...monitoringPlugins,
];

export async function registerAllPlugins(
  fastify: FastifyInstance
): Promise<PluginRegistrationResult> {
  const register = new PluginRegister(fastify);
  return await register.registerPlugins(allPlugins);
}
