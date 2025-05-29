import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";

/* ─────── Типы с сохранением твоих обозначений ─────── */

type Params = { id: string };

const getDocument = async (docId: number) => {
  return await prisma.documents.findUnique({
    where: { id: docId },
    include: {
      partner: {
        select: {
          short_name: true,
          full_name: true,
          edrpou: true,
        },
      },
      partner_account_number: {
        select: {
          bank_account: true,
          bank_name: true,
          mfo: true,
        },
      },
      spec_doc: {
        orderBy: { id: "desc" },
      },
    },
  });
};

export type DocumentWithIncludesNullable = Awaited<ReturnType<typeof getDocument>>;
export type DocumentWithIncludes = NonNullable<DocumentWithIncludesNullable>;

/* ─────── GET handler ─────── */

const getHandler = async (
  _req: NextRequest,
  _body: null,
  params: Params,
  _user: Session["user"] | null
) => {
  const docId = parseInt(params.id, 10);
  if (isNaN(docId)) {
    return NextResponse.json({ error: "Invalid document ID" }, { status: 400 });
  }

  const document = await getDocument(docId);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
};

/* ─────── Экспорт с авторизацией ─────── */

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
