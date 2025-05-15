
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma-client';
import { apiRoute } from '@/utils/apiRoute';
import { Roles } from '@/constants/roles';
import type { Session } from 'next-auth';
import { auto_payment } from '@prisma/client';
import { hasRole } from '@/lib/access/hasRole';

//postHandler
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
const postHandler = async (
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

// getHandler
export type AutoPaymentWithDocs = auto_payment & {
  documents: {
    id: number;
    entity_id: number;
    account_number: string;
    purpose_of_payment: string;
    entity: {
      id: number;
      short_name: string;
      full_name: string;
    };
    partner: {
      short_name: string;
      full_name: string;
    };
  };
};

const getHandler = async (
  _req: NextRequest,
  _body: null,
  _params: {},
  user: Session["user"] | null
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(user.role, Roles.ADMIN)) {
    return NextResponse.json(
      { message: "Forbidden: Admins only" },
      { status: 403 }
    );
  }

  const result: AutoPaymentWithDocs[] = await prisma.auto_payment.findMany({
    where: { is_deleted: false },
    include: {
      documents: {
        select: {
          id: true,
          entity_id: true,
          account_number: true,
          purpose_of_payment: true,
          entity: {
            select: {
              id: true,
              short_name: true,
              full_name: true,
            },
          },
          partner: {
            select: {
              short_name: true,
              full_name: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(result);
};

export const POST = apiRoute<AutoPaymentDto>(postHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});

export const GET = apiRoute(getHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
