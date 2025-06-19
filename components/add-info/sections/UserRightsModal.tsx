"use client";

import { useEffect, useState } from "react";
import type { user, entity } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Checkbox,
} from "@/components/ui";
import { apiClient } from "@/services/api-client";
import type { PartnersWithAccounts } from "@/services/partners";
import { toast } from "@/lib/hooks/use-toast";
import { LoadingMessage } from "@/components/ui";

interface Props {
  user: user & {
    users_entities: { entity: entity }[];
    users_partners: { partners: PartnersWithAccounts }[];
  };
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => Promise<void>;
}

export function UserRightsModal({ user, open, onOpenChange, onSaved }: Props) {
  const [entities, setEntities] = useState<entity[]>([]);
  const [partners, setPartners] = useState<PartnersWithAccounts[]>([]);
  const [loading, setLoading] = useState(false);

  const entityRights = new Set(user.users_entities.map((u) => u.entity.id));
  const partnerRights = new Set(user.users_partners.map((p) => p.partners.id));

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const ents = await apiClient.entities.getAll();
        setEntities(ents);
        const partnerLists = await Promise.all(
          ents.map((e) => apiClient.partners.partnersService(e.id))
        );
        setPartners(partnerLists.flat().filter(Boolean) as PartnersWithAccounts[]);
      } finally {
        setLoading(false);
      }
    })();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Права пользователя</DialogTitle>
        </DialogHeader>
        {loading ? (
          <LoadingMessage />
        ) : (
          <Tabs defaultValue="entities" className="space-y-3 w-[400px] min-h-[600px]">
            <TabsList>
              <TabsTrigger value="entities">Юрлица</TabsTrigger>
              <TabsTrigger value="partners">Контрагенты</TabsTrigger>
            </TabsList>
            <TabsContent value="entities" className="space-y-2">
              {entities.map((e) => (
                <label key={e.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={entityRights.has(e.id)}
                    onCheckedChange={() => toggleEntity(e.id)}
                  />
                  {e.short_name}
                </label>
              ))}
            </TabsContent>
            <TabsContent value="partners" className="space-y-2">
              {partners.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={partnerRights.has(p.id)}
                    onCheckedChange={() => togglePartner(p.id)}
                  />
                  {p.short_name}
                </label>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
