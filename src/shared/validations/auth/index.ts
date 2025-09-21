import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  phoneNumberSchema,
} from '@shared/validations/common';
import { tenantNameSchema } from '@shared/validations/common';

export const signupSchema = z
  .object({
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    newTenantName: tenantNameSchema.optional(),
    existingTenantName: tenantNameSchema.optional(),
    whatsappNumber: phoneNumberSchema.optional(),
  })
  .refine(
    (data) => {
      // Exactly one of newTenantName or existingTenantName must be provided
      return (
        (data.newTenantName && !data.existingTenantName) ||
        (!data.newTenantName && data.existingTenantName)
      );
    },
    {
      message:
        'Either newTenantName or existingTenantName must be provided, but not both',
      path: ['tenantName'],
    }
  );

export const signinSchema = z.object({
  identifier: z.string().min(1, 'Identifier Whatsapp or Email is required'),
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
