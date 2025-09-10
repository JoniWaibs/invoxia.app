process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

import { allPlugins, registerAllPlugins } from '@plugins/utils';
import { corsPlugin } from '@plugins/security/cors';
import { helmetPlugin } from '@plugins/security/helmet';
import type { PluginConfig } from '@models/plugins';
import Fastify from 'fastify';

describe('Plugins', () => {
  describe('allPlugins array', () => {
    it('should contain security plugins', () => {
      expect(allPlugins).toContain(corsPlugin);
      expect(allPlugins).toContain(helmetPlugin);
      expect(allPlugins).toHaveLength(6); // jwt + auth + errorHandler + validation + cors + helmet
    });

    it('should have valid plugin configurations', () => {
      allPlugins.forEach((plugin: PluginConfig) => {
        expect(plugin).toHaveProperty('name');
        expect(plugin).toHaveProperty('plugin');
        expect(plugin).toHaveProperty('enabled');
        expect(plugin).toHaveProperty('environments');
        expect(typeof plugin.name).toBe('string');
        expect(typeof plugin.enabled).toBe('boolean');
        expect(Array.isArray(plugin.environments)).toBe(true);
      });
    });
  });

  describe('registerAllPlugins', () => {
    it('should register plugins successfully', async () => {
      const fastify = Fastify({ logger: false });

      const result = await registerAllPlugins(fastify);

      expect(result.registered).toEqual([
        'jwt',
        'auth',
        'errorHandler',
        'validation',
        'cors',
        'helmet',
      ]);
      expect(result.skipped).toEqual([]);
      expect(result.errors).toEqual([]);

      await fastify.close();
    });
  });
});
