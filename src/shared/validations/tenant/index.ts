import { z } from 'zod';
import {
  cuitSchema,
  puntoVentaSchema,
  tenantNameSchema,
} from '@shared/validations/common';

export const certificatePath = z.string().optional();

export const createTenantSchema = z.object({
  name: tenantNameSchema,
});

export const updateTenantNameSchema = z.object({
  name: tenantNameSchema,
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
  certificatePath: z.string().optional(),
  keyPath: z.string().optional(),
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

export const tenantValidation = {
  update: {
    schema: {
      body: {
        config: afipConfigSchema,
      },
    },
  },
  profile: {},
};
