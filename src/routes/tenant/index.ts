import type { FastifyInstance } from 'fastify';
import { TenantService } from '@services/TenantService';
import { tenantValidation } from '@shared/validations/tenant';
import type { JWTPayload } from '@plugins/auth/jwt';
import { createValidationHandler } from '@plugins/middleware/validation';
import { AuthorizationError } from '@shared/errors';
import type {
  UpdateTenantRequest,
  TenantCredentialsRequest,
  TenantCredentialsResponse,
  UpdateTenantResponse,
  TenantResponse,
} from '@models/routes/tenant';
import { BaseApiResponse } from '@models/routes/common';

async function tenantRoutes(fastify: FastifyInstance) {
  const tenantService = new TenantService();

  fastify.get<{ Reply: BaseApiResponse<TenantResponse> }>(
    '/',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { tenantId } = request.user as JWTPayload;

      const tenant = await tenantService.getTenantSettings(tenantId);

      return reply.send({
        message: 'Tenant settings retrieved successfully',
        data: tenant,
      });
    }
  );

  fastify.post<{
    Body: TenantCredentialsRequest;
    Reply: BaseApiResponse<TenantCredentialsResponse>;
  }>(
    '/credentials',
    {
      preHandler: [
        fastify.authenticate,
        createValidationHandler({
          body: tenantValidation.credentials.schema.body,
        }),
      ],
    },
    async (request, reply) => {
      const { tenantId } = request.user as JWTPayload;
      const { certPath, keyPath } = request.body;

      const result = await tenantService.updateCredentials(tenantId, {
        certPath,
        keyPath,
      });

      return reply.send({
        message: 'Credentials updated successfully',
        data: {
          certPath: result.certPath,
          keyPath: result.keyPath,
        },
      });
    }
  );

  fastify.put<{
    Params: { id: string };
    Body: UpdateTenantRequest;
    Reply: BaseApiResponse<UpdateTenantResponse>;
  }>(
    '/:id',
    {
      preHandler: [
        fastify.authenticate,
        createValidationHandler({
          body: tenantValidation.updateTenant.schema.body,
        }),
      ],
    },
    async (request, reply) => {
      const { tenantId } = request.user as JWTPayload;
      const { id } = request.params;
      const updateData = request.body;

      if (id !== tenantId) {
        throw new AuthorizationError('You can only update your own tenant');
      }

      const updatedTenant = await tenantService.updateTenantConfig(
        id,
        updateData
      );

      return reply.send({
        message: 'Tenant updated successfully',
        data: updatedTenant,
      });
    }
  );
}

export default tenantRoutes;
