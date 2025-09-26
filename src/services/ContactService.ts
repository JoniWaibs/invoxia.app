import { BaseService } from './BaseService';
import { ContactRepository } from '@repositories/ContactRepository';
import { NotFoundError, ConflictError, ValidationError } from '@shared/errors';
import type {
  CreateContactRequest,
  UpdateContactRequest,
  GetContactsQuery,
  ContactResponse,
  ContactListResponse,
} from '@models/routes/contact';
import { toContactResponse } from '@adapters/contact';

export class ContactService extends BaseService {
  private contactRepo: ContactRepository;

  constructor() {
    super();
    this.contactRepo = new ContactRepository(this.prisma);
  }

  async createContact(
    tenantId: string,
    data: CreateContactRequest
  ): Promise<ContactResponse> {

    const existingContact = await this.contactRepo.findByDocument(
      tenantId,
      data.docType,
      data.docNumber
    );

    if (existingContact) {
      throw new ConflictError(
        `Contact with ${data.docType} ${data.docNumber} already exists`
      );
    }


    this.validateContactData(data);

    const contact = await this.contactRepo.create({
      tenantId,
      fullName: data.fullName,
      docType: data.docType,
      docNumber: data.docNumber,
      email: data.email ?? null,
      whatsapp: data.whatsapp ?? null,
      ivaCondition: data.ivaCondition ?? null,
      address: data.address ?? null,
    });

    return toContactResponse(contact);
  }

  async getContactById(
    contactId: string,
    tenantId: string
  ): Promise<ContactResponse> {
    const contact = await this.contactRepo.findById(contactId, tenantId);

    if (!contact) {
      throw new NotFoundError('Contact', contactId);
    }

    return toContactResponse(contact);
  }

  async getContacts(
    tenantId: string,
    query: GetContactsQuery
  ): Promise<ContactListResponse> {
    const { q: search, page = 1, limit = 20 } = query;

    const result = await this.contactRepo.findMany({
      tenantId,
      search,
      page,
      limit,
    });

    return {
      contacts: result.contacts.map((contact) => toContactResponse(contact)),
      total: result.total,
      page,
      limit,
    };
  }

  async updateContact(
    contactId: string,
    tenantId: string,
    data: UpdateContactRequest
  ): Promise<ContactResponse> {
    const existingContact = await this.contactRepo.findById(
      contactId,
      tenantId
    );
    if (!existingContact) {
      throw new NotFoundError('Contact', contactId);
    }

    // Check for document conflicts if document is being changed
    if (data.docType || data.docNumber) {
      const newDocType = data.docType || existingContact.docType;
      const newDocNumber = data.docNumber || existingContact.docNumber;

      // Only check if the document is actually changing
      const isDocumentChanging =
        newDocType !== existingContact.docType ||
        newDocNumber !== existingContact.docNumber;

      if (isDocumentChanging) {
        const conflictingContact = await this.contactRepo.findByDocument(
          tenantId,
          newDocType,
          newDocNumber
        );

        if (conflictingContact && conflictingContact.id !== contactId) {
          throw new ConflictError(
            `Contact with ${newDocType} ${newDocNumber} already exists`
          );
        }
      }
    }

    // Validate business rules for updated data
    if (Object.keys(data).length > 0) {
      const mergedValidationData = {
        fullName: data.fullName ?? existingContact.fullName,
        docType: data.docType ?? existingContact.docType,
        docNumber: data.docNumber ?? existingContact.docNumber,
        email: data.email ?? existingContact.email ?? undefined,
        whatsapp: data.whatsapp ?? existingContact.whatsapp ?? undefined,
        ivaCondition:
          data.ivaCondition ?? existingContact.ivaCondition ?? undefined,
        address: data.address ?? existingContact.address ?? undefined,
      };
      this.validateContactData(mergedValidationData);
    }

    const updateData: Partial<{
      fullName: string;
      docType: import('@prisma/client').DocumentType;
      docNumber: string;
      email: string | null;
      whatsapp: string | null;
      ivaCondition: import('@prisma/client').AFIPCondition | null;
      address: string | null;
    }> = {};

    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.docType !== undefined) updateData.docType = data.docType;
    if (data.docNumber !== undefined) updateData.docNumber = data.docNumber;
    if (data.email !== undefined) updateData.email = data.email ?? null;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp ?? null;
    if (data.ivaCondition !== undefined) updateData.ivaCondition = data.ivaCondition ?? null;
    if (data.address !== undefined) updateData.address = data.address ?? null;

    const updatedContact = await this.contactRepo.update(
      contactId,
      tenantId,
      updateData
    );

    if (!updatedContact) {
      throw new NotFoundError('Contact', contactId);
    }

    return toContactResponse(updatedContact);
  }

  async deleteContact(contactId: string, tenantId: string): Promise<void> {
    const deleted = await this.contactRepo.delete(contactId, tenantId);

    if (!deleted) {
      throw new NotFoundError('Contact', contactId);
    }
  }

  async getContactCount(tenantId: string): Promise<number> {
    return this.contactRepo.countByTenant(tenantId);
  }

  private validateContactData(data: Partial<CreateContactRequest | UpdateContactRequest>): void {
    if (!data.email && !data.whatsapp) {
      throw new ValidationError(
        'At least one contact method (email or WhatsApp) is required'
      );
    }

    if (data.docType === 'CUIT' && data.docNumber) {
      this.validateCuit(data.docNumber);
    }

    if (data.docType === 'CUIT' && data.fullName) {
      if (data.fullName.length < 3) {
        throw new ValidationError(
          'Company name must be at least 3 characters for CUIT'
        );
      }
    }
  }
}
