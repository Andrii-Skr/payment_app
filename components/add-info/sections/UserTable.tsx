"use client";

import { useState } from "react";
import type { UserWithRelations } from "@api/users/route";

import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { Pencil, Shield, Trash2 } from "lucide-react";

import { UserEditModal } from "./userEditModal";
import { UserRightsModal } from "./userRightsModal";

interface Props {
  rows: UserWithRelations[];
  onRemove: (id: number, is_deleted: boolean) => Promise<void>;
  onUpdated: () => Promise<void>;
}

export function UserTable({ rows, onRemove, onUpdated }: Props) {
  const [editTarget, setEditTarget] = useState<UserWithRelations | null>(null);
  const [rightsTarget, setRightsTarget] = useState<UserWithRelations | null>(null);

  return (
    <>
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
                <Button size="icon" variant="outline" onClick={() => setEditTarget(u)}>
                  <Pencil size={16} />
                </Button>
                <Button size="icon" variant="outline" onClick={() => setRightsTarget(u)}>
                  <Shield size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className={u.is_deleted ? "bg-green-500" : "bg-red-500"}
                  onClick={() => onRemove(u.id, !u.is_deleted)}
                >
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editTarget && (
        <UserEditModal
          user={editTarget}
          open={!!editTarget}
          onOpenChange={(v) => !v && setEditTarget(null)}
          onSaved={async () => {
            setEditTarget(null);
            await onUpdated();
          }}
        />
      )}

      {rightsTarget && (
        <UserRightsModal
          user={rightsTarget}
          open={!!rightsTarget}
          onOpenChange={(v) => !v && setRightsTarget(null)}
          onSaved={async () => {
            setRightsTarget(null);
            await onUpdated();
          }}
        />
      )}
    </>
  );
}
