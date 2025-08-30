import type { FastifyInstance } from 'fastify';
import { PluginRegistrar } from './registry';
import { securityPlugins } from './security';
import type { PluginRegistrationResult } from '../models/plugins';

export const allPlugins = [
  ...securityPlugins,
  // Add more plugin categories here as you expand:
  // ...authenticationPlugins,
  // ...validationPlugins,
  // ...rateLimitPlugins,
  // ...monitoringPlugins,
];

export async function registerAllPlugins(fastify: FastifyInstance): Promise<PluginRegistrationResult> {
  const register = new PluginRegistrar(fastify);
  return await register.registerPlugins(allPlugins);
}
