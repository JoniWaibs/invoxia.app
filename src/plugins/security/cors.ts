import cors from '@fastify/cors';
import type { PluginConfig } from '../../models/plugins';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const corsPlugin: PluginConfig = {
  name: 'cors',
  plugin: cors,
  enabled: true,
  environments: ['development', 'production', 'test'],
  options: {
    origin: isDevelopment 
      ? true
      : isProduction
      ? [
          'https://your-domain.com',
          'https://www.your-domain.com',
          /\.railway\.app$/,
        ]
      : false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With', 
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-API-Key'
    ],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
};