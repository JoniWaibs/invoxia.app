import type { FastifyInstance } from 'fastify';
import { AuthService } from '@services/AuthService';
import { authValidation } from '@shared/validations/auth/';
import type { JWTPayload } from '@plugins/auth/jwt';
import { createValidationHandler } from '@plugins/middleware/validation';
import type {
  SignupRequest,
  SigninRequest,
  ChangePasswordRequest,
  AuthResponse,
  ProfileResponse,
} from '@models/routes/auth';
import { toUserResponse, toBasicTenantResponse } from '@adapters/auth';
import { BaseApiResponse } from '@models/routes/common';

async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();

  fastify.post<{ Body: SignupRequest; Reply: BaseApiResponse<AuthResponse> }>(
    '/signup',
    {
      preHandler: [
        createValidationHandler({ body: authValidation.signup.schema.body }),
      ],
    },
    async (request, reply) => {
      const {
        email,
        password,
        newTenantName,
        existingTenantName,
        whatsappNumber,
      } = request.body;

      const result = await authService.signup({
        ...(email && { email }),
        ...(password && { password }),
        ...(newTenantName && { newTenantName }),
        ...(existingTenantName && { existingTenantName }),
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
          user: toUserResponse(result.user),
          tenant: toBasicTenantResponse(result.tenant),
          token,
        },
      });
    }
  );

  fastify.post<{ Body: SigninRequest; Reply: BaseApiResponse<AuthResponse> }>(
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
          user: toUserResponse(result.user),
          tenant: toBasicTenantResponse(result.tenant),
          token,
        },
      });
    }
  );

  fastify.get<{ Reply: BaseApiResponse<ProfileResponse> }>(
    '/profile',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { userId } = request.user as JWTPayload;

      const result = await authService.getUserById(userId);

      return reply.send({
        message: 'Profile retrieved successfully',
        data: {
          user: toUserResponse(result.user),
          tenant: toBasicTenantResponse(result.tenant),
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
