// src/prisma/data/documents.ts
import prisma from "@/prisma/prisma-client";
import { Prisma } from "@prisma/client";
import { normalizeArray, ReplaceDecimal } from "@/utils/normalizeDecimal";

/* ───────── сырой тип из Prisma ───────── */
export type DocumentWithPartnerDB = Prisma.documentsGetPayload<{
  include: {
    partner: {
      select: {
        short_name: true;
        full_name: true;
      };
    };
    spec_doc: true;
  };
}>;

/* ───────── UI-тип: Decimal → number ───────── */
export type DocumentWithPartner = ReplaceDecimal<DocumentWithPartnerDB>;

/* ───────── документы одной entity ───────── */
export async function getDocumentsForEntity(
  entityId: number
): Promise<DocumentWithPartner[]> {
  const raw = await prisma.documents.findMany({
    where: {
      entity_id: entityId,
      is_saved: true,
      is_deleted: false,
      is_paid: false,
    },
    include: {
      partner: { select: { short_name: true, full_name: true } },
      spec_doc: true,
    },
    orderBy: { date: "desc" },
  });

  return normalizeArray(raw); // ← account_sum / vat_percent уже number
}

/* ───────── документы для выбранных партнёров ───────── */
export async function getDocumentsForPartners(
  entityId: number,
  partnerIds: number[]
): Promise<DocumentWithPartner[]> {
  const raw = await prisma.documents.findMany({
    where: {
      entity_id: entityId,
      partner_id: { in: partnerIds },
      is_saved: true,
      is_deleted: false,
      is_paid: false,
    },
    include: {
      partner: { select: { short_name: true, full_name: true } },
      spec_doc: true,
    },
    orderBy: { date: "desc" },
  });

  return normalizeArray(raw);
}
