import type { FastifyInstance } from 'fastify';
import { AuthService } from '@services/AuthService';
import { authValidation } from '@shared/validations/auth/';
import { ConflictError, NotFoundError } from '@shared/errors';
import type { JWTPayload } from '@plugins/auth/jwt';
import { createValidationHandler } from '@plugins/middleware/validation';
import type {
  SignupRequest,
  SigninRequest,
  ChangePasswordRequest,
  Auth,
  Profile,
} from '@models/routes/auth';
import { BaseApiResponse } from '@models/routes/common';

async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();

  fastify.post<{ Body: SignupRequest; Reply: BaseApiResponse<Auth> }>(
    '/signup',
    {
      preHandler: [
        createValidationHandler({ body: authValidation.signup.schema.body }),
      ],
    },
    async (request, reply) => {
      const { email, password, tenantName, whatsappNumber } = request.body;

      const existingTenant = await authService.findTenantByName(tenantName);

      if (existingTenant) {
        throw new ConflictError(`Firma "${tenantName}" already exists`);
      }

      if (email) {
        const existingUser = await authService.findUserByEmail(email);
        if (existingUser) {
          throw new ConflictError('Email is already registered');
        }
      }

      if (whatsappNumber) {
        const existingUser =
          await authService.findUserByWhatsApp(whatsappNumber);
        if (existingUser) {
          throw new ConflictError('WhatsApp number is already registered');
        }
      }

      const result = await authService.signup({
        ...(email && { email }),
        ...(password && { password }),
        tenantName,
        ...(whatsappNumber && { whatsappNumber }),
      });

      const token = fastify.generateToken({
        userId: result.user.id,
        tenantId: result.tenant.id,
        ...(result.user.email && { email: result.user.email }),
      });

      return reply.send({
        message: 'User and Firma created successfully',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email || 'unknown',
            whatsappNumber: result.user.whatsappNumber,
            tenantId: result.user.tenantId,
          },
          tenant: {
            id: result.tenant.id,
            name: result.tenant.name,
          },
          token,
        },
      });
    }
  );

  fastify.post<{ Body: SigninRequest; Reply: BaseApiResponse<Auth> }>(
    '/signin',
    {
      preHandler: [
        createValidationHandler({ body: authValidation.signin.schema.body }),
      ],
    },
    async (request, reply) => {
      const { identifier, password } = request.body;

      const result = await authService.signin(identifier, password);

      const token = fastify.generateToken({
        userId: result.user.id,
        tenantId: result.user.tenantId,
        ...(result.user.email && { email: result.user.email }),
      });

      return reply.send({
        message: 'Login successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email || 'unknown',
            whatsappNumber: result.user.whatsappNumber,
            tenantId: result.user.tenantId,
          },
          tenant: {
            id: result.tenant.id,
            name: result.tenant.name,
          },
          token,
        },
      });
    }
  );

  fastify.get<{ Reply: BaseApiResponse<Profile> }>(
    '/profile',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { userId } = request.user as JWTPayload;

      const result = await authService.getUserProfile(userId);

      if (!result) {
        throw new NotFoundError('User not found');
      }

      return reply.send({
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email || 'unknown',
            whatsappNumber: result.user.whatsappNumber,
            tenantId: result.user.tenantId,
          },
          tenant: {
            id: result.tenant.id,
            name: result.tenant.name,
            afipCuit: result.tenant.afipCuit || 'unknown',
            afipPv: result.tenant.afipPv || 0,
            afipCondition: result.tenant.afipCondition || 'unknown',
          },
        },
      });
    }
  );

  fastify.patch<{ Body: ChangePasswordRequest; Reply: { message: string } }>(
    '/change-password',
    {
      preHandler: [
        fastify.authenticate,
        createValidationHandler({
          body: authValidation.changePassword.schema.body,
        }),
      ],
    },
    async (request, reply) => {
      const { userId } = request.user as JWTPayload;
      const { currentPassword, newPassword } = request.body;

      await authService.changePassword(userId, currentPassword, newPassword);

      return reply.send({
        message: 'Password updated successfully',
      });
    }
  );
}

export default authRoutes;
