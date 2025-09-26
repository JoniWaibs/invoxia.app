import { z } from 'zod';
import {
  createContactSchema,
  updateContactSchema,
  getContactsQuerySchema,
} from '@shared/validations/contact';

export type CreateContactRequest = z.infer<typeof createContactSchema>;
export type UpdateContactRequest = z.infer<typeof updateContactSchema>;
export type GetContactsQuery = z.infer<typeof getContactsQuerySchema>;
