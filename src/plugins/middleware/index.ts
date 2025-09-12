import { errorHandlerPlugin } from './errorHandler';
import type { PluginConfig } from '@models/plugins';

export const middlewarePlugins: PluginConfig[] = [errorHandlerPlugin];
