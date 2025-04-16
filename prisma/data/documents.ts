import { DocumentWithPartner } from "@/app/api/document/entity/[entity_id]/route";
import prisma from "@/prisma/prisma-client";

export async function getDocumentsForEntity(
  entityId: number
): Promise<DocumentWithPartner[]> {
  return prisma.documents.findMany({
    where: {
      entity_id: entityId,
      is_saved: true,
      is_deleted: false,
      is_paid: false,
    },
    include: {
      partners: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getDocumentsForPartners(
  entityId: number,
  partnerIds: number[]
): Promise<DocumentWithPartner[]> {
  return prisma.documents.findMany({
    where: {
      entity_id: entityId,
      partner_id: { in: partnerIds },
      is_saved: true,
      is_deleted: false,
      is_paid: false,
    },
    include: {
      partners: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });
}

export function fullDocumentSelect() {
    return {
      id: true,
      entity_id: true,
      partner_id: true,
      account_number: true,
      account_sum: true,
      purpose_of_payment: true,
      bank_account: true,
      date: true,
      partners: true,
      spec_doc: true,
    };
  }


