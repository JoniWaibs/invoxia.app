import { errorHandlerPlugin } from './errorHandler';
import { validationPluginConfig } from './validation';
import type { PluginConfig } from '@models/plugins';

export const middlewarePlugins: PluginConfig[] = [
  errorHandlerPlugin,
  validationPluginConfig,
];
