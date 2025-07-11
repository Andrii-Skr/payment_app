"use client";

import { useEffect, useState } from "react";
import type {  entity } from "@prisma/client";
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

export function UserRightsModal({ user, open, onOpenChange, onSaved }: Props) {
  const [entities, setEntities] = useState<entity[]>([]);
  const [partners, setPartners] = useState<PartnersWithAccounts[]>([]);
  const [loading, setLoading] = useState(false);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);

  const entityRights = new Set(user.users_entities.map((u) => u.entity.id));
  const partnerRights = new Set(user.users_partners.map((p) => p.partners.id));

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const ents = await apiClient.entities.getAll();
        setEntities(ents);
      } finally {
        setLoading(false);
      }
    })();
    setSelectedEntityId(null);
    setPartners([]);
  }, [open]);

  const toggleEntity = async (id: number) => {
    try {
      await apiClient.users.updateRights({
        user_id: user.id,
        add_entities: entityRights.has(id) ? undefined : [id],
        remove_entities: entityRights.has(id) ? [id] : undefined,
      });
      toast.success("Права обновлены");
      await onSaved();
    } catch {
      toast.error("Не удалось обновить права");
    }
  };

  const togglePartner = async (id: number) => {
    try {
      await apiClient.users.updateRights({
        user_id: user.id,
        add_partners: partnerRights.has(id) ? undefined : [id],
        remove_partners: partnerRights.has(id) ? [id] : undefined,
      });
      toast.success("Права обновлены");
      await onSaved();
    } catch {
      toast.error("Не удалось обновить права");
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
            <div className="space-y-2">
              {entities.map((e) => (
                <label
                  key={e.id}
                  onClick={() => selectEntity(e.id)}
                  className={`flex items-center gap-2 text-sm cursor-pointer ${
                    selectedEntityId === e.id ? 'font-medium' : ''
                  }`}
                >
                  <Checkbox
                    checked={entityRights.has(e.id)}
                    onCheckedChange={() => toggleEntity(e.id)}
                    className="shrink-0"
                  />
                  {e.short_name}
                </label>
              ))}
            </div>
            <div className="space-y-2">
              {selectedEntityId === null ? (
                <p className="text-sm text-muted-foreground">Выберите юрлицо</p>
              ) : partnersLoading ? (
                <LoadingMessage />
              ) : (
                partners.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={partnerRights.has(p.id)}
                      onCheckedChange={() => togglePartner(p.id)}
                      className="shrink-0"
                    />
                    {p.short_name}
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
