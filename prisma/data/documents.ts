
import prisma from "@/prisma/prisma-client";
import { Prisma } from "@prisma/client";

export type DocumentWithPartner = Prisma.documentsGetPayload<{
  include: {
    partner: {
      select: {
        short_name: true;
        full_name: true;
      };
    };
  };
}>;

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
      partner: { select: { short_name: true,full_name:true } },
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
      partner: { select: { short_name: true,full_name:true } },
    },
    orderBy: { date: "desc" },
  });
}
