import { z } from 'zod';
import {
  cuitSchema,
  ivaConditionSchema,
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

export const afipConfigSchema = z.object({
  cuit: cuitSchema.optional(),
  puntoVenta: puntoVentaSchema.optional(),
  condition: ivaConditionSchema.optional(),
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
  condition: ivaConditionSchema,
});

export const updateTenantSchema = z.object({
  name: tenantNameSchema.optional(),
  afipCuit: cuitSchema.optional(),
  afipCondition: ivaConditionSchema.optional(),
  afipPv: puntoVentaSchema.optional(),
});

export const tenantCredentialsSchema = z.object({
  certPath: z.string().min(1, 'Certificate path is required'),
  keyPath: z.string().min(1, 'Key path is required'),
});

export const tenantValidation = {
  update: {
    schema: {
      body: {
        config: afipConfigSchema,
      },
    },
  },
  updateTenant: {
    schema: {
      body: updateTenantSchema,
    },
  },
  credentials: {
    schema: {
      body: tenantCredentialsSchema,
    },
  },
  profile: {},
};
