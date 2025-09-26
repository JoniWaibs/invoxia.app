import type { Contact } from '@prisma/client';
import type { ContactResponse } from '@models/routes/contact';

export function toContactResponse(contact: Contact): ContactResponse {
  return {
    id: contact.id,
    fullName: contact.fullName,
    docType: contact.docType,
    docNumber: contact.docNumber,
    email: contact.email || undefined,
    whatsapp: contact.whatsapp || undefined,
    ivaCondition: contact.ivaCondition || undefined,
    address: contact.address || undefined,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}
