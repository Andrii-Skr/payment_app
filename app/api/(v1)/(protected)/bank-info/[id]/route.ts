import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import type { Session } from "next-auth";
import { Roles } from "@/constants/roles";

// GET handler
type Params = { id: string };

const getBankInfo = async (id: string) => {
  return await prisma.bank_info.findUnique({
    where: { mfo: id },
  });
};

export type BankInfoWithIncludesNullable = Awaited<
  ReturnType<typeof getBankInfo>
>;
export type BankInfoWithIncludes = NonNullable<BankInfoWithIncludesNullable>;

const getHandler = async (
  _req: NextRequest,
  _body: null,
  params: Params,
  _user: Session["user"] | null
) => {
  const id = params.id;

  const bank_info: BankInfoWithIncludesNullable = await getBankInfo(id);

  if (!bank_info) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(bank_info);
};

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
