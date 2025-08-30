import { helmetPlugin } from './helmet';
import { corsPlugin } from './cors';
import type { PluginRegistry } from '../../models/plugins';

export const securityPlugins: PluginRegistry = [corsPlugin, helmetPlugin];
