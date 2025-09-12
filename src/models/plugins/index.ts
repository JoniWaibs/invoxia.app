import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

export interface PluginConfig {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugin: any;
  options?: FastifyPluginOptions;
  enabled?: boolean;
  environments?: ('development' | 'production' | 'test')[];
}

export type PluginRegistry = PluginConfig[];

export interface PluginRegistrationResult {
  registered: string[];
  skipped: string[];
  errors: Array<{ plugin: string; error: string }>;
}

export type PluginRegistrar = (
  fastify: FastifyInstance
) => Promise<PluginRegistrationResult>;
