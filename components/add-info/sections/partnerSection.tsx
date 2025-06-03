// PartnerSection.tsx
import { EntitySelectController } from "@/components/shared/entitySelectController";
import { PartnersTable } from "./partnersTable";

export const PartnerSection = () => (
  <EntitySelectController>
    {(entityId) => <PartnersTable entityId={entityId} />}
  </EntitySelectController>
);
