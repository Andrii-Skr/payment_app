"use client";

import type { TemplateWithBankDetails } from "@api/templates/[id]/route";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import type React from "react";
import { type MouseEvent, useCallback, useEffect, useState } from "react";
import { Checkbox, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";
import { apiClient } from "@/services/api-client";

import { TemplateEditModal } from "./templateEditModal";

/* -------------------------------------------------------------------------- */
interface SampleTableProps {
  entityId: number | null;
}

export const SampleTable: React.FC<SampleTableProps> = ({ entityId }) => {
  /* ----------------------- local state ---------------------- */
  const [templates, setTemplates] = useState<TemplateWithBankDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TemplateWithBankDetails | null>(null);

  /* ------------------------ data load ----------------------- */
  const loadTemplates = useCallback(async () => {
    if (!entityId) return;
    setIsLoading(true);
    try {
      const data = await apiClient.templates.getById(entityId!, {
        showHidden,
        showDeleted,
      });
      setTemplates(data);
    } finally {
      setIsLoading(false);
    }
  }, [entityId, showHidden, showDeleted]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  /* -------------------------- CRUD -------------------------- */
  const handleToggleVisibility = async (tpl: TemplateWithBankDetails) => {
    try {
      await apiClient.templates.toggleVisibility(tpl.id, !tpl.is_visible);
      toast.success(tpl.is_visible ? "Шаблон скрыт" : "Шаблон восстановлен");
      await loadTemplates();
    } catch {
      toast.error("Не удалось изменить видимость");
    }
  };

  const handleToggleDelete = async (tpl: TemplateWithBankDetails) => {
    try {
      await apiClient.templates.toggleDelete(tpl.id, !tpl.is_deleted);
      toast.success(tpl.is_deleted ? "Шаблон восстановлен" : "Шаблон удалён");
      await loadTemplates();
    } catch {
      toast.error("Не удалось изменить статус удаления");
    }
  };

  /* ----------------------- filtering ------------------------ */
  const filtered = templates.filter((t) => {
    if (!showHidden && !t.is_visible) return false;
    if (!showDeleted && t.is_deleted) return false;
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.partner.short_name.toLowerCase().includes(q);
  });

  /* ------------------------- render ------------------------- */
  if (!entityId) return <p className="text-muted-foreground">Выберите юрлицо</p>;

  return (
    <div className="space-y-3">
      {/* Фильтр + чекбоксы */}
      <Input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Поиск по названию / получателю"
        className="max-w-xs"
      />

      <div className="flex items-center gap-4 pl-1">
        <Checkbox id="showHidden" checked={showHidden} onCheckedChange={(v) => setShowHidden(!!v)} />
        <label htmlFor="showHidden" className="text-sm select-none">
          Показать скрытые
        </label>

        <Checkbox id="showDeleted" checked={showDeleted} onCheckedChange={(v) => setShowDeleted(!!v)} />
        <label htmlFor="showDeleted" className="text-sm select-none">
          Показать удалённые
        </label>
      </div>

      {/* Таблица */}
      {isLoading ? (
        <p>Загрузка…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Шаблоны не найдены</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Получатель</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((tpl, idx) => (
              <TableRow key={tpl.id} className={tpl.is_deleted ? "opacity-50" : ""}>
                <TableCell className="text-center">{idx + 1}</TableCell>
                <TableCell>{tpl.name}</TableCell>
                <TableCell>{tpl.partner.short_name}</TableCell>
                <TableCell className="flex gap-2 justify-end">
                  {/* hide/show */}
                  <Button
                    size="icon"
                    variant="outline"
                    className={tpl.is_visible ? "bg-red-500" : "bg-green-500"}
                    title={tpl.is_visible ? "Скрыть" : "Показать"}
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      handleToggleVisibility(tpl);
                    }}
                  >
                    {tpl.is_visible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>

                  {/* edit */}
                  <Button
                    size="icon"
                    variant="outline"
                    title="Редактировать"
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      setEditTarget(tpl);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </Button>

                  {/* delete/restore */}
                  <Button
                    size="icon"
                    variant="outline"
                    className={tpl.is_deleted ? "bg-green-500" : "bg-red-500"}
                    title={tpl.is_deleted ? "Восстановить" : "Удалить"}
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      handleToggleDelete(tpl);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal */}
      {editTarget && (
        <TemplateEditModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          template={editTarget}
          onSaved={async () => {
            setModalOpen(false);
            await loadTemplates();
          }}
        />
      )}
    </div>
  );
};
