// PartnerSection.tsx
import { EntitySelectController } from "@/components/shared/entitySelectController";
import { PartnersTable } from "./PartnersTable";

export const PartnerSection = () => (
  <EntitySelectController>
    {(entityId) => <PartnersTable entityId={entityId} />}
  </EntitySelectController>
);
