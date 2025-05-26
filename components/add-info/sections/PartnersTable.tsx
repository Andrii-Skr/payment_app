"use client";

import { useEffect, useState, Fragment } from "react";
import { apiClient } from "@/services/api-client";
import { PartnersWithAccounts } from "@/services/partners";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ChoiceDialog,
} from "@/components/ui/";
import { partner_account_number } from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";

export const PartnersTable = ({ entityId }: { entityId: number | null }) => {
  const [partners, setPartners] = useState<PartnersWithAccounts[]>([]);
  const [expandedPartner, setExpandedPartner] = useState<number | null>(null);
  const [choiceDialog, setChoiceDialog] = useState<{
    open: boolean;
    partnerId?: number;
    type?: "edit" | "delete";
  }>({ open: false });

  useEffect(() => {
    if (!entityId) return;
    apiClient.partners.partnersService(entityId).then((data) => {
      setPartners(data ?? []);
    });
  }, [entityId]);

  // empty state
  if (!entityId)
    return (
      <Card className="mt-6 p-4 rounded-2xl shadow-sm text-muted-foreground text-center">
        Выберите юрлицо для отображения контрагентов
      </Card>
    );

  if (!partners.length)
    return (
      <Card className="mt-6 p-4 rounded-2xl shadow-sm text-muted-foreground text-center">
        Контрагенты не найдены
      </Card>
    );

  return (
    <Card className="mt-6 rounded-2xl shadow-sm p-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Полное Имя</TableHead>
            <TableHead>Короткое Имя</TableHead>
            <TableHead>ЕДРПОУ</TableHead>

            <TableHead className="w-36 text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((p) => (
            <Fragment key={p.id}>
              <TableRow
                onClick={() =>
                  setExpandedPartner((id) => (id === p.id ? null : p.id))
                }
                className="cursor-pointer hover:bg-muted transition"
              >
                <TableCell>{p.full_name}</TableCell>
                <TableCell>{p.short_name}</TableCell>
                <TableCell>{p.edrpou}</TableCell>

                <TableCell className="flex gap-2 justify-end">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {}}
                    title="Редактировать"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className={
                      p.is_deleted
                        ? "bg-green-500"
                        : "bg-red-500"
                    }
                    title={p.is_deleted ? "Восстановить" : "Удалить"}
                    onClick={() => {}}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
              {expandedPartner === p.id && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="p-0">
                    <PartnerAccountsTable accounts={p.partner_account_number} />
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <ChoiceDialog
        open={choiceDialog.open}
        title={
          choiceDialog.type === "edit"
            ? "Редактировать контрагента?"
            : "Удалить контрагента?"
        }
        description={
          choiceDialog.type === "delete"
            ? "Это действие нельзя отменить."
            : undefined
        }
        choices={[
          {
            label: choiceDialog.type === "edit" ? "Редактировать" : "Удалить",
            onSelect: () => {
              // вызов API для удаления/редактирования
              setChoiceDialog({ open: false });
              // TODO: интеграция функций
            },
          },
        ]}
        onCancel={() => setChoiceDialog({ open: false })}
      />
    </Card>
  );
};

const PartnerAccountsTable = ({
  accounts,
}: {
  accounts: partner_account_number[];
}) => (
  <Card className="m-4 p-4 bg-background rounded-xl shadow">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Счет</TableHead>
          <TableHead>Банк</TableHead>
          <TableHead>МФО</TableHead>
          <TableHead>По умолчанию</TableHead>
          <TableHead className="w-28 text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((acc) => (
          <TableRow key={acc.id}>
            <TableCell>{acc.bank_account}</TableCell>
            <TableCell>{acc.bank_name}</TableCell>
            <TableCell>{acc.mfo}</TableCell>
            <TableCell>{acc.is_default ? "Да" : ""}</TableCell>
            <TableCell className="flex gap-2 justify-end">
              <Button
                size="icon"
                variant="outline"
                onClick={() => {}}
                title="Редактировать"
              >
                <Pencil />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className={
                  acc.is_deleted
                    ? "bg-green-500"
                    : "bg-red-500"
                }
                title={acc.is_deleted ? "Восстановить" : "Удалить"}
                onClick={() => {}}
              >
                <Trash2/>
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {!accounts.length && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground"
            >
              Нет счетов
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Card>
);
