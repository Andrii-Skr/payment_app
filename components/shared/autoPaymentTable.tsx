"use client";
import type { AutoPaymentWithDocs } from "@api/regular-payments/route";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/";
import { apiClient } from "@/services/api-client";

export const AutoPaymentTable: React.FC = () => {
  const [autoPayments, setAutoPayments] = useState<AutoPaymentWithDocs[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    apiClient.autoPayments
      .get()
      .then((data: AutoPaymentWithDocs[] | undefined) => {
        if (!data) return;
        setAutoPayments(data);
      })
      .catch((error) => {
        console.error("Ошибка получения данных автооплат:", error);
      });
  }, []);

  const toggleGroup = (entityId: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entityId)) {
        newSet.delete(entityId);
      } else {
        newSet.add(entityId);
      }
      return newSet;
    });
  };

  const handleCancel = async (id: number) => {
    try {
      await apiClient.autoPayments.deleteById(id);
      // Повторно загружаем список автооплат
      const updatedData = await apiClient.autoPayments.get();
      if (updatedData) {
        setAutoPayments(updatedData);
      }
    } catch (error) {
      console.error("Ошибка при отмене автооплаты:", error);
    }
  };

  // Группируем платежи по documents.entity_id и собираем порядок сортировки
  const { groupedPayments, entityOrderMap } = autoPayments.reduce<{
    groupedPayments: Record<number, AutoPaymentWithDocs[]>;
    entityOrderMap: Map<number, number>;
  }>(
    (acc, payment) => {
      const key = payment.documents.entity_id;
      if (!acc.groupedPayments[key]) {
        acc.groupedPayments[key] = [];
      }
      acc.groupedPayments[key].push(payment);
      if (!acc.entityOrderMap.has(key)) {
        acc.entityOrderMap.set(key, payment.documents.entity.sort_order ?? 0);
      }
      return acc;
    },
    { groupedPayments: {}, entityOrderMap: new Map() },
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Юрлицо</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedPayments)
            .sort(([a], [b]) => (entityOrderMap.get(+a) ?? 0) - (entityOrderMap.get(+b) ?? 0))
            .map(([entityId, payments]) => {
              const groupExpanded = expandedGroups.has(Number(entityId));
              const firstPayment = payments[0];
              return (
                <React.Fragment key={entityId}>
                  <TableRow onClick={() => toggleGroup(Number(entityId))} className="cursor-pointer hover:bg-gray-100">
                    <TableCell>{firstPayment.documents.entity.short_name}</TableCell>
                  </TableRow>
                  {groupExpanded && (
                    <TableRow>
                      <TableCell colSpan={1} className="bg-gray-50">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead>Контрагент</TableHead>
                              <TableHead>Номер счета</TableHead>
                              <TableHead>Назначение платежа</TableHead>
                              <TableHead>Сумма платежа</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payments.map((payment) => (
                              <TableRow
                                key={payment.id}
                                onDoubleClick={() =>
                                  router.push(
                                    `/create/payment-form/${payment.documents.entity_id}?doc_id=${payment.documents.id}`,
                                  )
                                }
                              >
                                <TableCell>{payment.documents.partner.short_name}</TableCell>
                                <TableCell>{payment.documents.account_number}</TableCell>
                                <TableCell>{payment.documents.purpose_of_payment}</TableCell>
                                <TableCell>{Number(payment.pay_sum)}</TableCell>
                                <TableCell>
                                  <Button variant="destructive" size="sm" onClick={() => handleCancel(payment.id)}>
                                    Отменить
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
};
