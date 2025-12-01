"use client";

import type { UserWithRelations } from "@api/users/route";
import type { entity } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle, LoadingMessage } from "@/components/ui";
import { toast } from "@/lib/hooks/use-toast";
import { apiClient } from "@/services/api-client";
import type { PartnersWithAccounts } from "@/services/partners";

interface Props {
  user: UserWithRelations;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => Promise<void>;
}

export function UserRightsModal({ user, open, onOpenChange, onSaved }: Props) {
  /* -------------------- данные -------------------- */
  const [entities, setEntities] = useState<entity[]>([]);
  const [partners, setPartners] = useState<PartnersWithAccounts[]>([]);
  const [loading, setLoading] = useState(false);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);

  /* локальные права для мгновенного UI */
  const [entityRights, setEntityRights] = useState<Set<number>>(new Set());
  const [partnerRights, setPartnerRights] = useState<Map<number, Set<number>>>(new Map());

  /* текущий выбранный объект юрлица (удобно для заголовка) */
  const selectedEntity = useMemo(
    () => entities.find((e) => e.id === selectedEntityId) || null,
    [entities, selectedEntityId],
  );

  /* инициализируем права */
  useEffect(() => {
    if (!open) return;
    setEntityRights(new Set(user.users_entities.map((u) => u.entity.id)));
    const map = new Map<number, Set<number>>();
    user.users_partners.forEach((p) => {
      if (!map.has(p.entity_id)) map.set(p.entity_id, new Set<number>());
      map.get(p.entity_id)?.add(p.partner_id);
    });
    setPartnerRights(map);
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
    const current = partnerRights.get(selectedEntityId) || new Set<number>();
    const had = current.has(id);
    const nextCurrent = new Set(current);
    had ? nextCurrent.delete(id) : nextCurrent.add(id);
    setPartnerRights((prev) => {
      const map = new Map(prev);
      map.set(selectedEntityId, nextCurrent);
      return map;
    });
    try {
      await apiClient.users.updateRights({
        user_id: user.id,
        add_partners: had ? undefined : [{ partner_id: id, entity_id: selectedEntityId ?? 0 }],
        remove_partners: had ? [{ partner_id: id, entity_id: selectedEntityId ?? 0 }] : undefined,
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
      <DialogContent className="min-w-[700px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Права пользователя</DialogTitle>
        </DialogHeader>

        {loading ? (
          <LoadingMessage />
        ) : (
          <div className="grid grid-cols-2 gap-4 w-[650px]">
            {/* ───── Юрлица ───── */}
            <div className="space-y-1 pr-2 border-r">
              {entities.map((e) => {
                const isSelected = selectedEntityId === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => selectEntity(e.id)}
                    className={`flex w-full items-center gap-2 text-left text-sm cursor-pointer rounded-md px-2 py-1 transition-colors ${
                      isSelected ? "bg-primary/15 text-primary font-semibold" : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={entityRights.has(e.id)}
                      onCheckedChange={() => toggleEntity(e.id)}
                      onClick={(ev) => ev.stopPropagation()}
                      className="shrink-0"
                    />
                    <span>{e.short_name}</span>
                  </button>
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
                    <p className="text-sm font-semibold mb-1 text-muted-foreground">{selectedEntity.short_name}</p>

                    {partners.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Нет контрагентов</p>
                    ) : (
                      partners.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1 hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            checked={partnerRights.get(selectedEntityId ?? -1)?.has(p.id) ?? false}
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
