"use client";

import { useEffect, useState, Fragment, MouseEvent } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

import { apiClient } from "@/services/api-client";
import { PartnersWithAccounts } from "@/services/partners";
import { PartnerForm } from "./partnerForm";
import { PartnerEditModal } from "./partnerEditModal";
import { PartnerAccountsList } from "./partnerAccountsList";
import { toast } from "@/lib/hooks/use-toast";
import { useToggleDelete } from "@/lib/hooks/useToggleDelete";

export const PartnersTable = ({ entityId }: { entityId: number | null }) => {
  const [partners, setPartners] = useState<PartnersWithAccounts[]>([]);
  const [editTarget, setEditTarget] = useState<PartnersWithAccounts | null>(
    null
  );
  const [expanded, setExpanded] = useState<number | null>(null);
  const [reload, setReload] = useState(0);
  const [loadingAccId, setLoadingAccId] = useState<number | null>(null);

  const [showDeleted, setShowDeleted] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const reloadPartners = () => setReload((v) => v + 1);

  /* ——— helpers ——— */
  const mutatePartner = (
    partnerId: number,
    cb: (p: PartnersWithAccounts) => PartnersWithAccounts
  ) => {
    setPartners((prev) => prev.map((p) => (p.id === partnerId ? cb(p) : p)));
  };

  /* ——— fetch ——— */
  useEffect(() => {
    if (!entityId) return;
    apiClient.partners
      .partnersService(entityId, { showDeleted: true, showHidden: true })
      .then((data) => setPartners(data ?? []));
  }, [entityId, reload]);

  /* clean state when entity changes */
  useEffect(() => {
    setExpanded(null);
    setEditTarget(null);
    setLoadingAccId(null);
  }, [entityId]);

  /* ——— фильтрация для чекбоксов ——— */
  const filteredPartners = partners.filter((p) => {
    const rel = p.entities?.[0];
    if (!showDeleted && rel?.is_deleted) return false;
    if (!showHidden && rel?.is_visible === false) return false;
    return true;
  });

  /* ——— Удалить / восстановить партнёра ——— */
  const togglePartnerDelete = useToggleDelete({
    apiFn: apiClient.partners.deletePartner, // (partner_id, is_deleted, entity_id)
    mutateFn: (id, is_deleted, _entityId) =>
      mutatePartner(id, (x) => ({
        ...x,
        entities: x.entities.map((rel) =>
          rel.entity_id === entityId ? { ...rel, is_deleted } : rel
        ),
      })),
    getEntityState: (id, _entityId) =>
      partners.find((p) => p.id === id)?.entities?.[0]?.is_deleted ?? false,
    messages: {
      delete: "Контрагент удалён",
      restore: "Контрагент восстановлен",
      error: "Ошибка при обновлении статуса контрагента",
    },
  });

  /* ——— Скрыть / показать ——— */
  const handleToggleVisibility = async (p: PartnersWithAccounts) => {
    const current = p.entities?.[0];
    if (!current) return;

    try {
      await apiClient.partners.togglePartnerVisibility(
        p.id,
        !current.is_visible,
        entityId!
      );

      mutatePartner(p.id, (x) => ({
        ...x,
        entities: x.entities.map((rel) =>
          rel.entity_id === entityId
            ? { ...rel, is_visible: !rel.is_visible }
            : rel
        ),
      }));

      toast.success(
        !current.is_visible ? "Контрагент показан" : "Контрагент скрыт"
      );
    } catch {
      toast.error("Ошибка при смене видимости");
    }
  };

  /* ——— назначить счёт дефолтным ——— */
  const handleSetDefault = async (partnerId: number, accId: number) => {
    setLoadingAccId(accId);
    try {
      if (entityId === null) {
        toast.error("Не выбрано юрлицо");
        return;
      }
      await apiClient.partners.setDefaultAccount(accId, entityId, true);
      mutatePartner(partnerId, (p) => ({
        ...p,
        partner_account_number: p.partner_account_number.map((a) => ({
          ...a,
          is_default: a.id === accId,
        })),
      }));
      toast.success("Счёт назначен основным");
    } catch {
      toast.error("Не удалось назначить счёт");
    } finally {
      setLoadingAccId(null);
    }
  };

  /* ——— удалить / восстановить счёт ——— */
  const handleDeleteAccount = useToggleDelete({
    apiFn: apiClient.partners.deleteAccount,
    mutateFn: (accId, is_deleted, _entityId) =>
      setPartners((prev) =>
        prev.map((p) => ({
          ...p,
          partner_account_number: p.partner_account_number.map((a) =>
            a.id === accId ? { ...a, is_deleted } : a
          ),
        }))
      ),
    getEntityState: (accId, _entityId) =>
      partners
        .flatMap((p) => p.partner_account_number)
        .find((a) => a.id === accId)?.is_deleted ?? false,
    messages: {
      delete: "Счёт удалён",
      restore: "Счёт восстановлен",
      error: "Ошибка при изменении счёта",
    },
  });

  /* ——— рендер ——— */
  if (!entityId) {
    return (
      <Card className="mt-6 p-4 rounded-2xl shadow-sm text-muted-foreground text-center">
        Выберите юрлицо
      </Card>
    );
  }

  return (
    <Card className="mt-6 rounded-2xl shadow-sm p-0 overflow-hidden">
      {/* — верхняя панель — */}
      <div className="p-4 border-b space-y-2">
        <PartnerForm
          key={`create-${entityId}`}
          mode="create"
          entityId={entityId}
          onSaved={reloadPartners}
        />

        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={showDeleted}
              onCheckedChange={(v) => setShowDeleted(Boolean(v))}
            />
            Показать удалённые
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={showHidden}
              onCheckedChange={(v) => setShowHidden(Boolean(v))}
            />
            Показать скрытые
          </label>
        </div>
      </div>

      {/* — таблица — */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Полное имя</TableHead>
            <TableHead>Короткое имя</TableHead>
            <TableHead>ЕДРПОУ</TableHead>
            <TableHead className="w-36 text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredPartners.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                Контрагенты не найдены
              </TableCell>
            </TableRow>
          ) : (
            filteredPartners.map((p) => {
              const rel = p.entities[0];
              return (
                <Fragment key={p.id}>
                  <TableRow
                    onClick={() =>
                      setExpanded((id) => (id === p.id ? null : p.id))
                    }
                    className="cursor-pointer hover:bg-muted transition"
                  >
                    <TableCell>{p.full_name}</TableCell>
                    <TableCell>{p.short_name}</TableCell>
                    <TableCell>{p.edrpou}</TableCell>

                    <TableCell className="flex gap-2 justify-end">
                      {/* скрыть/показать */}
                      <Button
                        size="icon"
                        variant="outline"
                        className={
                          !rel.is_visible ? "bg-green-500" : "bg-red-500"
                        }
                        title={rel.is_visible ? "Скрыть" : "Показать"}
                        onClick={(e: MouseEvent) => {
                          e.stopPropagation();
                          handleToggleVisibility(p);
                        }}
                      >
                        {rel.is_visible ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </Button>

                      {/* редактировать */}
                      <Button
                        size="icon"
                        variant="outline"
                        title="Редактировать"
                        onClick={(e: MouseEvent) => {
                          e.stopPropagation();
                          setEditTarget(p);
                        }}
                      >
                        <Pencil size={16} />
                      </Button>

                      {/* удалить / восстановить */}
                      <Button
                        size="icon"
                        variant="outline"
                        className={
                          rel.is_deleted ? "bg-green-500" : "bg-red-500"
                        }
                        title={rel.is_deleted ? "Восстановить" : "Удалить"}
                        onClick={(e: MouseEvent) => {
                          e.stopPropagation();
                          togglePartnerDelete(p.id, entityId!);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* подтаблица счётов */}
                  {expanded === p.id && (
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={4} className="p-0">
                        <PartnerAccountsList
                          accounts={p.partner_account_number}
                          loadingId={loadingAccId}
                          showDeleted={showDeleted}
                          showHidden={showHidden}
                          entityId={entityId}
                          onSetDefault={(accId) =>
                            handleSetDefault(p.id, accId)
                          }
                          onDelete={(accId) =>
                            handleDeleteAccount(accId, entityId!)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* модалка редактирования */}
      {editTarget && (
        <PartnerEditModal
          open={!!editTarget}
          onOpenChange={(v) => !v && setEditTarget(null)}
          partner={editTarget}
          entityId={entityId}
          onSaved={reloadPartners}
        />
      )}
    </Card>
  );
};
