import prisma from "@/prisma/prisma-client";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
      const body = await request.json();

      const result = await prisma.documents.create({
        data: {
          entity_id: body.entity_id,
          partner_id: body.partner_id,
          account_number: body.accountNumber,
          date: new Date(body.date),
          account_sum: body.accountSum,
          bank_account: body.selectedAccount,
          mfo: body.mfo,
          purpose_of_payment: body.purposeOfPayment,
          user_id: 1,
          is_saved: true,
          spec_doc: {
            create: body.payments.map(({ paySum, expectedDate, deadLineDate } :{paySum: number, expectedDate: string, deadLineDate: string}) => ({
              pay_sum: paySum,
              expected_date: new Date(expectedDate),
              dead_line_date: new Date(deadLineDate)
            }))
          }
        }
      });

      return NextResponse.json(
        { success: true, message: 'Data processed successfully.' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error processing request:', error);
      return NextResponse.json(
        { success: false, message: 'Internal server error.' },
        { status: 500 }
      );
    }
  }
