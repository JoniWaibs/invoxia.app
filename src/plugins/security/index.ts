import { helmetPlugin } from '@plugins/security/helmet';
import { corsPlugin } from '@plugins/security/cors';
import type { PluginRegistry } from '@models/plugins';

export const securityPlugins: PluginRegistry = [corsPlugin, helmetPlugin];
