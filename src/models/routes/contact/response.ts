import { z } from 'zod';
import { createContactSchema } from '@shared/validations/contact';

export const contactResponseSchema = createContactSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const contactListResponseSchema = z.object({
  contacts: z.array(contactResponseSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(20),
});

export type ContactResponse = z.infer<typeof contactResponseSchema>;
export type ContactListResponse = z.infer<typeof contactListResponseSchema>;
