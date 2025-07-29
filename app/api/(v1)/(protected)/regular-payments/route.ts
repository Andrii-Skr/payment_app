
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma-client';
import { apiRoute } from '@/utils/apiRoute';
import { Roles } from '@/constants/roles';
import type { Session } from 'next-auth';
import { auto_payment } from '@prisma/client';
import { hasRole } from '@/lib/access/hasRole';
import { buildPaymentPurpose } from '@/lib/transformData/buildPaymentPurpose';

//postHandler
type AutoPaymentDto = {
  documents_id: number;
  paySum: number;
  expectedDate?: string;
  deadLineDate?: string;
  vatType: boolean;
  vatPercent: number;
  userId: number;
  purposeOfPayment?: string;
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
      purpose_of_payment: body.purposeOfPayment,
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
      sort_order: number;
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
              sort_order: true,
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

// PATCH handler
type UpdateBody = {
  doc_id: number;
};

const patchHandler = async (
  _req: NextRequest,
  body: UpdateBody,
  _params: {},
  user: Session["user"] | null,
) => {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { doc_id } = body;

  const autos = await prisma.auto_payment.findMany({
    where: { documents_id: doc_id, is_deleted: false },
    select: { id: true, pay_sum: true },
  });

  if (autos.length === 0) {
    return NextResponse.json(
      { message: "auto_payment не найден" },
      { status: 404 },
    );
  }

  const doc = await prisma.documents.findUnique({
    where: { id: doc_id },
    select: {
      purpose_of_payment: true,
      account_number: true,
      date: true,
      vat_type: true,
      vat_percent: true,
      is_auto_purpose_of_payment: true,
    },
  });

  if (!doc) {
    return NextResponse.json(
      { message: "Документ не найден" },
      { status: 404 },
    );
  }

  const updates = await Promise.all(
    autos.map((ap) => {
      const purpose = buildPaymentPurpose({
        mainPurpose: doc.purpose_of_payment,
        paySum: Number(ap.pay_sum),
        accountNumber: doc.account_number,
        date: doc.date,
        vatType: doc.vat_type,
        vatPercent: Number(doc.vat_percent),
        isAuto: doc.is_auto_purpose_of_payment,
      });

      return prisma.auto_payment.update({
        where: { id: ap.id },
        data: { purpose_of_payment: purpose, updated_at: new Date() },
      });
    })
  );

  return NextResponse.json({ count: updates.length });
};

export const PATCH = apiRoute<UpdateBody>(patchHandler, {
  requireAuth: true,
  roles: [Roles.ADMIN, Roles.MANAGER],
});
