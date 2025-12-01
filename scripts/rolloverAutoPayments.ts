import { Prisma, PrismaClient } from "@prisma/client";
import { getDate, lastDayOfMonth } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const prisma = new PrismaClient();
const TZ = "Europe/Kyiv";

export async function rolloverAutoPayments() {
  const todayKyiv = toZonedTime(new Date(), TZ);
  const y = todayKyiv.getFullYear();
  const m = todayKyiv.getMonth();
  const dMax = getDate(lastDayOfMonth(todayKyiv));

  const autos = await prisma.auto_payment.findMany({
    where: { is_deleted: false },
    select: {
      id: true,
      documents_id: true,
      pay_sum: true,
      expected_date: true,
      dead_line_date: true,
      purpose_of_payment: true,
    },
  });

  await prisma.$transaction(async (tx) => {
    for (const ap of autos) {
      const src = ap.expected_date ?? ap.dead_line_date;
      const srcField = ap.expected_date ? "expected_date" : ap.dead_line_date ? "dead_line_date" : null;
      if (!src || !srcField) continue;

      const srcKyiv = toZonedTime(src, TZ);
      if (srcKyiv.getFullYear() === y && srcKyiv.getMonth() === m) continue;

      const newD = Math.min(srcKyiv.getDate(), dMax);
      const newUtc = fromZonedTime(new Date(y, m, newD), TZ);

      /* ------------ ①  обновляем auto_payment ------------- */
      await tx.auto_payment.update({
        where: { id: ap.id },
        data: {
          [srcField]: newUtc,
          updated_at: new Date(),
        } as Prisma.auto_paymentUncheckedUpdateInput,
      });

      /* ------------ ②  пытаемся создать spec_doc ---------- */
      try {
        await tx.spec_doc.create({
          data: {
            pay_sum: ap.pay_sum,
            expected_date: newUtc,
            dead_line_date: newUtc,
            is_paid: false,
            created_at: new Date(),
            updated_at: new Date(),
            purpose_of_payment: ap.purpose_of_payment,

            /* связи через connect – теперь валидны */
            documents: { connect: { id: ap.documents_id } },
            auto_payment: { connect: { id: ap.id } },
          },
        });
      } catch (e) {
        /* ③  ловим дубль (уник. индекс) и при желании идём на UPDATE */
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          await tx.spec_doc.updateMany({
            where: {
              auto_payment: { id: ap.id },
              expected_date: newUtc,
              is_deleted: false,
            },
            data: {
              pay_sum: ap.pay_sum,
              dead_line_date: newUtc,
              updated_at: new Date(),
              purpose_of_payment: ap.purpose_of_payment,
            },
          });
        } else {
          throw e; // любая другая ошибка — прерываем транзакцию
        }
      }
    }
  });
}
