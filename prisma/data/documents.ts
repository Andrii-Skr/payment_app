import { DocumentWithPartner } from "@/app/api/(v1)/(protected)/documents/payments-list/[id]/route";
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
