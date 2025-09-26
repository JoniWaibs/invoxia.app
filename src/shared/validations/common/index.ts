import { z } from 'zod';

export const uuidSchema = z.string().uuid();

export const phoneNumberSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)')
  .min(10)
  .max(15);

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5)
  .max(254);

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name cannot exceed 100 characters')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Full name can only contain letters and spaces');

export const docTypeSchema = z.enum(['DNI', 'CUIT', 'CUIL'], {
  message: 'Document type must be DNI, CUIT, or CUIL',
});

export const docNumberSchema = z
  .string()
  .min(1, 'Document number is required')
  .regex(/^\d+$/, 'Document number must contain only digits')
  .min(7, 'Document number must be at least 7 digits')
  .max(11, 'Document number cannot exceed 11 digits');

export const cuitSchema = z
  .string()
  .regex(/^\d{2}-\d{8}-\d{1}$/, 'CUIT must be in format XX-XXXXXXXX-X');

export const ivaConditionSchema = z.enum(
  ['MONOTRIBUTO', 'RESPONSABLE_INSCRIPTO', 'EXENTO'],
  {
    message: 'Invalid IVA condition',
  }
);

export const addressSchema = z
  .string()
  .min(5, 'Address must be at least 5 characters')
  .max(200, 'Address cannot exceed 200 characters');

export const puntoVentaSchema = z.number().int().min(1).max(9999);

export const tenantNameSchema = z
  .string()
  .min(2, 'Tenant name must be at least 2 characters')
  .max(100, 'Tenant name cannot exceed 100 characters');
