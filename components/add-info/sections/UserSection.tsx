"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserWithRelations } from "@api/users/route";

import { apiClient } from "@/services/api-client";
import { Container } from "@/components/shared";
import { Checkbox, LoadingMessage } from "@/components/ui";
import { UserTable } from "./userTable";

export function UserSection() {
  const [rows, setRows] = useState<UserWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

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

  const filteredRows = useMemo(
    () => (showDeleted ? rows : rows.filter((u) => !u.is_deleted)),
    [rows, showDeleted]
  );

  const handleRemove = async (id: number, is_deleted: boolean) => {
    try {
      await apiClient.users.remove(id, is_deleted);
      await loadUsers();
    } catch (err) {
      setError(String(err));
    }
  };

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
        <UserTable rows={filteredRows} onRemove={handleRemove} onUpdated={loadUsers} />
      )}
    </Container>
  );
}
