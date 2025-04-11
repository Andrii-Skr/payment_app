import prisma from "@/prisma/prisma-client";
import { auto_payment } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";



export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "number") {
      return new NextResponse("Неверный ID", { status: 400 });
    }

    // Получаем auto_payment вместе с documents_id
    const autoPayment = await prisma.auto_payment.findUnique({
      where: { id },
      select: {
        id: true,
        documents_id: true,
      },
    });

    if (!autoPayment) {
      return new NextResponse("auto_payment не найден", { status: 404 });
    }

    // Обновляем обе модели: auto_payment и documents
    const [updatedAutoPayment, updatedDocument] = await Promise.all([
      prisma.auto_payment.update({
        where: { id },
        data: { is_deleted: true, updated_at: new Date() },
      }),
      prisma.documents.update({
        where: { id: autoPayment.documents_id },
        data: { is_auto_payment: false },
      }),
    ]);

    return NextResponse.json({ updatedAutoPayment, updatedDocument });
  } catch (error) {
    console.error("Ошибка при обновлении:", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}


