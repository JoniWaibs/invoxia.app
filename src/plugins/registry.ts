import type { FastifyInstance } from 'fastify';
import type {
  PluginConfig,
  PluginRegistry,
  PluginRegistrationResult,
} from '../models/plugins';

export class PluginRegistrar {
  private fastify: FastifyInstance;
  private currentEnv: string;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.currentEnv = process.env.NODE_ENV || 'development';
  }

  private async registerPlugin(
    config: PluginConfig
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (config.enabled === false) {
        return { success: false, error: 'Plugin disabled' };
      }

      if (
        config.environments &&
        !config.environments.includes(
          this.currentEnv as 'development' | 'production' | 'test'
        )
      ) {
        return {
          success: false,
          error: `Not enabled for ${this.currentEnv} environment`,
        };
      }

      await this.fastify.register(config.plugin, config.options || {});

      this.fastify.log.info(`Plugin registered: ${config.name}`);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.fastify.log.error(
        `Failed to register plugin ${config.name}: ${errorMessage}`
      );
      return { success: false, error: errorMessage };
    }
  }

  async registerPlugins(
    plugins: PluginRegistry
  ): Promise<PluginRegistrationResult> {
    const result: PluginRegistrationResult = {
      registered: [],
      skipped: [],
      errors: [],
    };

    for (const pluginConfig of plugins) {
      const registrationResult = await this.registerPlugin(pluginConfig);

      if (registrationResult.success) {
        result.registered.push(pluginConfig.name);
      } else {
        if (
          registrationResult.error?.includes('disabled') ||
          registrationResult.error?.includes('environment')
        ) {
          result.skipped.push(
            `${pluginConfig.name}: ${registrationResult.error}`
          );
        } else {
          result.errors.push({
            plugin: pluginConfig.name,
            error: registrationResult.error || 'Unknown error',
          });
        }
      }
    }

    this.fastify.log.info(
      {
        registered: result.registered.length,
        skipped: result.skipped.length,
        errors: result.errors.length,
      },
      'Plugin registration summary'
    );

    if (result.errors.length > 0) {
      this.fastify.log.warn(
        { errors: result.errors },
        'Some plugins failed to register'
      );
    }

    return result;
  }
}
