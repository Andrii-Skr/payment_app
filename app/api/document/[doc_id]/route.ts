import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from "@/utils/apiRoute";
import type { Session } from "next-auth";

type Params = { id: string };

const handler = async (
  _req: NextRequest,
  _body: null,
  params: Params,
  _user: Session["user"] | null
): Promise<NextResponse> => {
  const entityId = parseInt(params.id, 10);

  if (isNaN(entityId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  return NextResponse.json({ entityId });
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> } // ✅ нужно в 15.3.0
) {
  return apiRoute<null, Params>(handler)(req, context);
}
