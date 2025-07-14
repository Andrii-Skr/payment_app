"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { entity } from "@prisma/client";
import type { UserWithRelations } from "@api/users/route";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Checkbox,
} from "@/components/ui";
import { apiClient } from "@/services/api-client";
import type { PartnersWithAccounts } from "@/services/partners";
import { toast } from "@/lib/hooks/use-toast";
import { LoadingMessage } from "@/components/ui";

interface Props {
  user: UserWithRelations;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => Promise<void>;
}

export function UserRightsModal({
  user,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  /* -------------------- данные -------------------- */
  const [entities, setEntities] = useState<entity[]>([]);
  const [partners, setPartners] = useState<PartnersWithAccounts[]>([]);
  const [loading, setLoading] = useState(false);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);

  /* локальные права для мгновенного UI */
  const [entityRights, setEntityRights] = useState<Set<number>>(new Set());
  const [partnerRights, setPartnerRights] = useState<Set<number>>(new Set());

  /* текущий выбранный объект юрлица (удобно для заголовка) */
  const selectedEntity = useMemo(
    () => entities.find((e) => e.id === selectedEntityId) || null,
    [entities, selectedEntityId]
  );

  /* инициализируем права */
  useEffect(() => {
    if (!open) return;
    setEntityRights(new Set(user.users_entities.map((u) => u.entity.id)));
    setPartnerRights(new Set(user.users_partners.map((p) => p.partners.id)));
  }, [user, open]);

  /* загружаем юрлица */
  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        setEntities(await apiClient.entities.getAll());
      } finally {
        setLoading(false);
      }
    })();
    setSelectedEntityId(null);
    setPartners([]);
  }, [open]);

  /* -------------------- колбеки -------------------- */
  const toggleEntity = async (id: number) => {
    const had = entityRights.has(id);
    setEntityRights((prev) => {
      const next = new Set(prev);
      had ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      await apiClient.users.updateRights({
        user_id: user.id,
        add_entities: had ? undefined : [id],
        remove_entities: had ? [id] : undefined,
      });
      toast.success("Права обновлены");
      onSaved();
    } catch {
      toast.error("Не удалось обновить права");
      onSaved();
    }
  };

  const togglePartner = async (id: number) => {
    if (selectedEntityId == null) return;
    const had = partnerRights.has(id);
    setPartnerRights((prev) => {
      const next = new Set(prev);
      had ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      await apiClient.users.updateRights({
        user_id: user.id,
        add_partners: had
          ? undefined
          : [{ partner_id: id, entity_id: selectedEntityId ?? 0 }],
        remove_partners: had
          ? [{ partner_id: id, entity_id: selectedEntityId ?? 0 }]
          : undefined,
      });
      toast.success("Права обновлены");
      onSaved();
    } catch {
      toast.error("Не удалось обновить права");
      onSaved();
    }
  };

  const selectEntity = async (id: number) => {
    setSelectedEntityId(id);
    setPartnersLoading(true);
    try {
      const data = await apiClient.partners.partnersService(id);
      setPartners((data ?? []) as PartnersWithAccounts[]);
    } finally {
      setPartnersLoading(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Права пользователя</DialogTitle>
        </DialogHeader>

        {loading ? (
          <LoadingMessage />
        ) : (
          <div className="grid grid-cols-2 gap-4 w-[600px]">
            {/* ───── Юрлица ───── */}
            <div className="space-y-1 pr-2 border-r">
              {entities.map((e) => {
                const isSelected = selectedEntityId === e.id;
                return (
                  <div
                    key={e.id}
                    onClick={() => selectEntity(e.id)}
                    className={`flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1 transition-colors ${
                      isSelected
                        ? "bg-primary/15 text-primary font-semibold"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={entityRights.has(e.id)}
                      onCheckedChange={() => toggleEntity(e.id)}
                      onClick={(ev) => ev.stopPropagation()}
                      className="shrink-0"
                    />
                    <span>{e.short_name}</span>
                  </div>
                );
              })}
            </div>

            {/* ───── Контрагенты ───── */}
            <div className="relative min-h-[200px] pl-1">
              {partnersLoading && <LoadingMessage />}
              <AnimatePresence mode="wait">
                {selectedEntity && !partnersLoading && (
                  <motion.div
                    key={selectedEntity.id}
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 60, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="space-y-1"
                  >
                    {/* Заголовок юрлица */}
                    <p className="text-sm font-semibold mb-1 text-muted-foreground">
                      {selectedEntity.short_name}
                    </p>

                    {partners.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Нет контрагентов
                      </p>
                    ) : (
                      partners.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1 hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            checked={partnerRights.has(p.id)}
                            onCheckedChange={() => togglePartner(p.id)}
                            onClick={(ev) => ev.stopPropagation()}
                            className="shrink-0"
                          />
                          <span>{p.short_name}</span>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
