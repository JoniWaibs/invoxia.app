import { z } from 'zod';
import { afipConfigSchema } from '@shared/validations/tenant';

export type UpdateRequest = z.infer<typeof afipConfigSchema>;
