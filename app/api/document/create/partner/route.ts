import prisma from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newPartner = await prisma.partners.create({
      data: {
        name: body.name,
        edrpou: body.edrpou,
        entity_id: body.entity_id,
        type: 0,
        group: [],
        partner_account_number: {
          create: {
            bank_account: body.accountNumber,
            mfo: "1",
          }
        }
      }
    });

    return NextResponse.json(
      { success: true, message: "Data processed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
