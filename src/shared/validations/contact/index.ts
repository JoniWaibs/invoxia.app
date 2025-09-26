import { z } from 'zod';
import {
  emailSchema,
  phoneNumberSchema,
  fullNameSchema,
  docTypeSchema,
  docNumberSchema,
  ivaConditionSchema,
  addressSchema,
} from '@shared/validations/common';

export const createContactSchema = z.object({
  fullName: fullNameSchema,
  docType: docTypeSchema,
  docNumber: docNumberSchema,
  email: emailSchema.optional(),
  whatsapp: phoneNumberSchema.optional(),
  ivaCondition: ivaConditionSchema.optional(),
  address: addressSchema.optional(),
});

export const updateContactSchema = z.object({
  fullName: fullNameSchema.optional(),
  docType: docTypeSchema.optional(),
  docNumber: docNumberSchema.optional(),
  email: emailSchema.optional(),
  whatsapp: phoneNumberSchema.optional(),
  ivaCondition: ivaConditionSchema.optional(),
  address: addressSchema.optional(),
});

export const getContactsQuerySchema = z.object({
  q: z.string().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(20),
});

export const contactValidation = {
  create: {
    schema: {
      body: createContactSchema,
    },
  },
  update: {
    schema: {
      body: updateContactSchema,
    },
  },
  list: {
    schema: {
      querystring: getContactsQuerySchema,
    },
  },
};
