"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditEntityDialog } from "@/components/add-info";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import type { Row } from "@/types/infoTypes";

type Props = {
  rows: Row[];
  /** ⇢ возвращает Promise, чтобы можно было await-ить в дочерних компонентах */
  onRemove: (id: number, is_deleted: boolean) => Promise<void>;
  onUpdate: (data: Partial<Row>) => Promise<void>;
};

export function EntityTable({ rows, onRemove, onUpdate }: Props) {
  const [editingRow, setEditingRow] = useState<Row | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Полное Имя</TableHead>
            <TableHead>Короткое Имя</TableHead>
            <TableHead>ЕДРПОУ</TableHead>
            <TableHead>р/с</TableHead>
            <TableHead>Сортировка</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.full_name}</TableCell>
              <TableCell>{r.short_name}</TableCell>
              <TableCell>{r.edrpou}</TableCell>
              <TableCell className="whitespace-nowrap">{r.bank_account}</TableCell>
              <TableCell>{r.sort_order}</TableCell>

              <TableCell className="flex space-x-2">
                <Button size="icon" variant="outline" onClick={() => setEditingRow(r)}>
                  <Pencil size={16} />
                </Button>

                {/* — toggle soft-delete */}
                <Button
                  size="icon"
                  variant="outline"
                  className={r.is_deleted ? "bg-green-500" : "bg-red-500"}
                  onClick={() => onRemove(r.id, !r.is_deleted)}
                >
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditEntityDialog
        row={editingRow}
        onClose={() => setEditingRow(null)}
        onSave={async (values) => {
          if (!editingRow) return;
          await onUpdate({ ...values, id: editingRow.id });
        }}
      />
    </>
  );
}
