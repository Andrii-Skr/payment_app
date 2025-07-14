"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/services/api-client";
import { Container } from "@/components/shared";
import { Checkbox, LoadingMessage } from "@/components/ui";
import { UserTable } from "./userTable";
import { UserEditModal } from "./userEditModal";
import { UserRightsModal } from "./userRightsModal";
import type { UserWithRelations } from "@api/users/route";

export function UserSection() {
  /* -------------------- данные -------------------- */
  const [rows, setRows] = useState<UserWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  /* -------------------- состояние модалок -------------------- */
  const [editTarget, setEditTarget] = useState<UserWithRelations | null>(null);
  const [rightsTarget, setRightsTarget] = useState<UserWithRelations | null>(null);

  /* -------------------- загрузка списка -------------------- */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.users.getAll(showDeleted);
      setRows(data);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /* -------------------- подтягиваем свежего пользователя для модалки прав -------------------- */
  useEffect(() => {
    if (!rightsTarget) return;
    const fresh = rows.find((u) => u.id === rightsTarget.id);
    if (fresh && fresh !== rightsTarget) setRightsTarget(fresh);
  }, [rows, rightsTarget]);

  /* -------------------- memo-фильтр удалённых -------------------- */
  const filteredRows = useMemo(
    () => (showDeleted ? rows : rows.filter((u) => !u.is_deleted)),
    [rows, showDeleted]
  );

  /* -------------------- удаление / восстановление -------------------- */
  const handleRemove = async (id: number, is_deleted: boolean) => {
    try {
      await apiClient.users.remove(id, is_deleted);
      await loadUsers();
    } catch (err) {
      setError(String(err));
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <Container className="flex-col items-start gap-5 w-full min-w-[995px]">
      <label className="flex items-center gap-2 select-none text-sm">
        <Checkbox
          checked={showDeleted}
          onCheckedChange={(v) => setShowDeleted(Boolean(v))}
          className="h-4 w-4"
        />
        Показать удалённые
      </label>

      {loading ? (
        <LoadingMessage />
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <UserTable
          rows={filteredRows}
          onRemove={handleRemove}
          onUpdated={loadUsers}
          onEdit={setEditTarget}
          onRights={setRightsTarget}
        />
      )}

      {/* ───── Модалка редактирования пользователя ───── */}
      {editTarget && (
        <UserEditModal
          user={editTarget}
          open={!!editTarget}
          onOpenChange={(v) => !v && setEditTarget(null)}
          onSaved={async () => {
            setEditTarget(null);
            await loadUsers();
          }}
        />
      )}

      {/* ───── Модалка прав пользователя ───── */}
      {rightsTarget && (
        <UserRightsModal
          user={rightsTarget}
          open={!!rightsTarget}
          onOpenChange={(v) => !v && setRightsTarget(null)}
          onSaved={loadUsers}           /* обновляем список, не закрываем окно */
        />
      )}
    </Container>
  );
}
