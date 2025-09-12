import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  phoneNumberSchema,
} from '@shared/validations/common';
import { tenantNameSchema } from '@shared/validations/tenant';

export const signupSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  tenantName: tenantNameSchema,
  whatsappNumber: phoneNumberSchema.optional(),
});

export const signinSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  newPassword: passwordSchema,
  currentPassword: passwordSchema,
});

export const authValidation = {
  signup: {
    schema: {
      body: signupSchema,
    },
  },
  signin: {
    schema: {
      body: signinSchema,
    },
  },
  profile: {},
  changePassword: {
    schema: {
      body: changePasswordSchema,
    },
  },
};
