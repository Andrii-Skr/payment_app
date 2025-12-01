import { EntitySelectController } from "@/components/shared/entitySelectController";
import { SampleTable } from "./sampleTable";

export const SampleSection = () => (
  <EntitySelectController>{(entityId) => <SampleTable entityId={entityId} />}</EntitySelectController>
);
