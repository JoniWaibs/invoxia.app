import { z } from 'zod';
import { phoneNumberSchema } from '@shared/validations/common';

// WhatsApp webhook validation schemas
export const whatsAppWebhookVerificationSchema = z.object({
  'hub.mode': z.literal('subscribe'),
  'hub.challenge': z.string(),
  'hub.verify_token': z.string(),
});

// WhatsApp message types
export const whatsAppTextMessageSchema = z.object({
  messaging_product: z.literal('whatsapp'),
  to: phoneNumberSchema,
  type: z.literal('text'),
  text: z.object({
    body: z.string().min(1).max(4096),
  }),
});

// WhatsApp webhook payload structure
export const whatsAppIncomingMessageSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.literal('whatsapp'),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            }),
            messages: z
              .array(
                z.object({
                  id: z.string(), // This is the messageId for idempotency
                  from: phoneNumberSchema,
                  timestamp: z.string(),
                  type: z.enum(['text', 'image', 'audio', 'video', 'document']),
                  text: z
                    .object({
                      body: z.string(),
                    })
                    .optional(),
                })
              )
              .optional(),
            statuses: z.array(z.any()).optional(),
          }),
          field: z.literal('messages'),
        })
      ),
    })
  ),
});

// WhatsApp command validation
export const whatsAppCommandSchema = z.object({
  command: z.enum([
    'ALTA',
    'NOMBRE',
    'AFIP_CUIT',
    'AFIP_PV',
    'AFIP_COND',
    'PROBAR_AFIP',
    'CREAR_FIRMA',
    'LISTAR_FIRMAS',
    'CAMBIAR_FIRMA',
    'LINK_CRED',
    'CANCELAR',
    'AYUDA',
  ]),
  args: z.array(z.string()).default([]),
  originalText: z.string(),
});

// Session state validation
export const sessionStateSchema = z.enum([
  'IDLE',
  'AWAITING_TENANT_NAME',
  'AWAITING_AFIP_CUIT',
  'AWAITING_AFIP_PV',
  'AWAITING_AFIP_COND',
]);
