import type { FastifyInstance } from 'fastify';
import { ContactService } from '@services/ContactService';
import { contactValidation } from '@shared/validations/contact';
import type { JWTPayload } from '@plugins/auth/jwt';
import { createValidationHandler } from '@plugins/middleware/validation';
import type {
  CreateContactRequest,
  UpdateContactRequest,
  GetContactsQuery,
  ContactResponse,
  ContactListResponse,
} from '@models/routes/contact';
import { BaseApiResponse } from '@models/routes/common';

async function contactRoutes(fastify: FastifyInstance) {
  const contactService = new ContactService();

  fastify.post<{
    Body: CreateContactRequest;
    Reply: BaseApiResponse<ContactResponse>;
  }>(
    '/',
    {
      preHandler: [
        fastify.authenticate,
        createValidationHandler({
          body: contactValidation.create.schema.body,
        }),
      ],
    },
    async (request, reply) => {
      const { tenantId } = request.user as JWTPayload;
      const contactData = request.body;

      const contact = await contactService.createContact(tenantId, contactData);

      return reply.status(201).send({
        message: 'Contact created successfully',
        data: contact,
      });
    }
  );

  fastify.get<{
    Querystring: GetContactsQuery;
    Reply: BaseApiResponse<ContactListResponse>;
  }>(
    '/',
    {
      preHandler: [
        fastify.authenticate,
        createValidationHandler({
          query: contactValidation.list.schema.querystring,
        }),
      ],
    },
    async (request, reply) => {
      const { tenantId } = request.user as JWTPayload;
      const query = request.query;

      const result = await contactService.getContacts(tenantId, query);

      return reply.send({
        message: 'Contacts retrieved successfully',
        data: result,
      });
    }
  );

  fastify.get<{
    Params: { id: string };
    Reply: BaseApiResponse<ContactResponse>;
  }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { tenantId } = request.user as JWTPayload;
      const { id } = request.params;

      const contact = await contactService.getContactById(id, tenantId);

      return reply.send({
        message: 'Contact retrieved successfully',
        data: contact,
      });
    }
  );

  fastify.put<{
    Params: { id: string };
    Body: UpdateContactRequest;
    Reply: BaseApiResponse<ContactResponse>;
  }>(
    '/:id',
    {
      preHandler: [
        fastify.authenticate,
        createValidationHandler({
          body: contactValidation.update.schema.body,
        }),
      ],
    },
    async (request, reply) => {
      const { tenantId } = request.user as JWTPayload;
      const { id } = request.params;
      const updateData = request.body;

      const contact = await contactService.updateContact(
        id,
        tenantId,
        updateData
      );

      return reply.send({
        message: 'Contact updated successfully',
        data: contact,
      });
    }
  );

  fastify.delete<{
    Params: { id: string };
    Reply: { message: string };
  }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { tenantId } = request.user as JWTPayload;
      const { id } = request.params;

      await contactService.deleteContact(id, tenantId);

      return reply.send({
        message: 'Contact deleted successfully',
      });
    }
  );
}

export default contactRoutes;
