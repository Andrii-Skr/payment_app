"use client";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Pencil, Shield, Trash2, Key } from "lucide-react";
import type { UserWithRelations } from "@api/users/route";

interface Props {
  rows: UserWithRelations[];
  onRemove: (id: number, is_deleted: boolean) => Promise<void>;
  onUpdated: () => Promise<void>;
  onEdit: (user: UserWithRelations) => void;
  onRights: (user: UserWithRelations) => void;
  onPassword: (user: UserWithRelations) => void;
}

export function UserTable({
  rows,
  onRemove,
  onUpdated,
  onEdit,
  onRights,
  onPassword,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Логин</TableHead>
          <TableHead>Имя</TableHead>
          <TableHead>Роль</TableHead>
          <TableHead className="w-32" />
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((u) => (
          <TableRow key={u.id} className={u.is_deleted ? "opacity-50" : ""}>
            <TableCell>{u.login}</TableCell>
            <TableCell>{u.name}</TableCell>
            <TableCell>{u.role.name}</TableCell>
            <TableCell className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => onEdit(u)}>
                <Pencil size={16} />
              </Button>
              <Button size="icon" variant="outline" onClick={() => onRights(u)}>
                <Shield size={16} />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onPassword(u)}
                disabled={u.password_protection}
                className={u.password_protection ? "cursor-not-allowed" : undefined}
                title={u.password_protection ? "Запрещено" : undefined}
              >
                <Key size={16} />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className={u.is_deleted ? "bg-green-500" : "bg-red-500"}
                onClick={async () => {
                  await onRemove(u.id, !u.is_deleted);
                  await onUpdated();
                }}
              >
                <Trash2 size={16} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
