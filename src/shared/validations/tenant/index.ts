import { z } from 'zod';
import { cuitSchema, puntoVentaSchema } from '@shared/validations/common';

export const tenantNameSchema = z
  .string()
  .min(2, 'Tenant name must be at least 2 characters')
  .max(100, 'Tenant name cannot exceed 100 characters');

export const createTenantSchema = z.object({
  name: tenantNameSchema,
});

export const updateTenantNameSchema = z.object({
  name: z.string().min(2).max(100).trim(),
});

export const afipConditionSchema = z.enum([
  'MONOTRIBUTO',
  'RESPONSABLE_INSCRIPTO',
  'EXENTO',
]);

export const afipConfigSchema = z.object({
  cuit: cuitSchema.optional(),
  puntoVenta: puntoVentaSchema.optional(),
  condition: afipConditionSchema.optional(),
});

export const updateAfipCuitSchema = z.object({
  cuit: cuitSchema,
});

export const updateAfipPuntoVentaSchema = z.object({
  puntoVenta: puntoVentaSchema,
});

export const updateAfipConditionSchema = z.object({
  condition: afipConditionSchema,
});
