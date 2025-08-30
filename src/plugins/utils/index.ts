import type { FastifyInstance } from 'fastify';
import { PluginRegister } from '@plugins/registry';
import { securityPlugins } from '@plugins/security';
import type { PluginRegistrationResult } from '@models/plugins';

export const allPlugins = [
  ...securityPlugins,
  // Add more plugin categories here as you expand:
  // ...authenticationPlugins,
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
