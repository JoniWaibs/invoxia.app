import { z } from 'zod';
import {
  changePasswordSchema,
  signinSchema,
  signupSchema,
} from '@shared/validations/auth';

export type SignupRequest = z.infer<typeof signupSchema>;

export type SigninRequest = z.infer<typeof signinSchema>;

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
