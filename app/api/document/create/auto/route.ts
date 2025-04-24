// app/api/auto-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma-client';
import { apiRoute } from '@/utils/apiRoute';
import { Roles } from '@/constants/roles';
import type { Session } from 'next-auth';

type AutoPaymentDto = {
  documents_id: number;
  paySum: number;
  expectedDate?: string;
  deadLineDate?: string;
  vatType: boolean;
  vatPercent: number;
  userId: number;
};

/* ---------- бизнес-логика ---------- */
const handler = async (
  _req: NextRequest,
  body: AutoPaymentDto,
  _params: {},                         // статический маршрут
  user: Session['user'] | null,
) => {
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const auto = await prisma.auto_payment.create({
    data: {
      documents_id: body.documents_id,
      pay_sum: body.paySum,
      expected_date: body.expectedDate ? new Date(body.expectedDate) : undefined,
      dead_line_date: body.deadLineDate ? new Date(body.deadLineDate) : undefined,
      user_id: Number(user.id),
    },
  });

  await prisma.documents.update({
    where: { id: body.documents_id },
    data: { is_auto_payment: true },
  });

  return NextResponse.json(
    { success: true, message: 'Data processed successfully.', auto },
    { status: 200 },
  );
};

/* ---------- экспорт для Next ---------- */
export const POST = apiRoute<AutoPaymentDto>(handler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
