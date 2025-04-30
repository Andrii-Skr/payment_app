
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";



// GET handler
type Params = { id: string };

const getDocument = async (docId: number) => {
  const document = await prisma.documents.findUnique({
    where: { id: docId },
    include: {
      partners: {
        select: {
          name: true,
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
    },
  });

  if (!document) return null;

  const spec_doc = await prisma.spec_doc.findMany({
    where: { documents_id: docId },
    orderBy: { id: "desc" },
  });

  return {
    ...document,
    spec_doc,
  };
};

export type DocumentWithIncludesNullable = Awaited<
  ReturnType<typeof getDocument>
>;
export type DocumentWithIncludes = NonNullable<DocumentWithIncludesNullable>;

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

  const document: DocumentWithIncludesNullable = await getDocument(docId);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
};



// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<Params> }
// ) {
//   return apiRoute<null, Params>(handler)(req, context);
// }

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});

