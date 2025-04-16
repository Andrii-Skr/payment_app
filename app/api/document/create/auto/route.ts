import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma-client";
import { apiRoute } from "@/utils/apiRoute";
import { Session } from "next-auth";

type AutoPaymentDto = {
  documents_id: number;
  paySum: number;
  expectedDate?: string;
  deadLineDate?: string;
  vatType: boolean;
  vatPercent: number;
  userId: number;
};

const handler = async (
  _req: NextRequest,
  body: AutoPaymentDto,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const auto = await prisma.auto_payment.create({
    data: {
      documents_id: body.documents_id,
      pay_sum: body.paySum,
      expected_date: body.expectedDate
        ? new Date(body.expectedDate)
        : undefined,
      dead_line_date: body.deadLineDate
        ? new Date(body.deadLineDate)
        : undefined,
      user_id: parseInt(user.id, 10),
    },
  });

  await prisma.documents.update({
    where: { id: body.documents_id },
    data: { is_auto_payment: true },
  });

  return NextResponse.json(
    { success: true, message: "Data processed successfully.", auto },
    { status: 200 }
  );
};

// ✅ Совместимо с Next.js 15 App Router
export async function POST(req: NextRequest, context: any) {
  return apiRoute<AutoPaymentDto>(handler, {
    requireAuth: true,
  })(req, context);
}
