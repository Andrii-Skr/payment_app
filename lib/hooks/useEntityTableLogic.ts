import { useMemo } from "react";
import { DocumentType } from "@/types/types";
export const useEntityTableLogic = ({
  documents,
  startDate,
  period,
  selectedEntity,
  partnerFilter,
  collator,
}: {
  documents: DocumentType[];
  startDate: Date;
  period: number;
  selectedEntity: number | "all";
  partnerFilter: string;
  collator: Intl.Collator;
}) => {
  const dateRange = useMemo(() => {
    return Array.from({ length: period }).map((_, index) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + index);
      return d;
    });
  }, [startDate, period]);

  const partnersMap = useMemo(() => {
    return documents.reduce((acc, doc) => {
      const partnerId = doc.partners.id;
      if (!acc[partnerId]) {
        acc[partnerId] = { partner: doc.partners, documents: [doc] };
      } else {
        acc[partnerId].documents.push(doc);
      }
      return acc;
    }, {} as Record<number, { partner: DocumentType["partners"]; documents: DocumentType[] }>);
  }, [documents]);

  const partnerRows = useMemo(() => {
    const rows = Object.values(partnersMap);
    rows.sort((a, b) => {
      const diff = a.partner.entity_id - b.partner.entity_id;
      return diff !== 0 ? diff : collator.compare(a.partner.name, b.partner.name);
    });
    return rows;
  }, [partnersMap, collator]);

  const filteredRows = useMemo(() => {
    return partnerRows.filter((row) => {
      const entityMatch = selectedEntity === "all" || row.partner.entity_id === selectedEntity;
      const nameMatch = row.partner.name.toLowerCase().includes(partnerFilter.toLowerCase());
      return entityMatch && nameMatch;
    });
  }, [partnerRows, selectedEntity, partnerFilter]);

  const groupedByEntity = useMemo(() => {
    return filteredRows.reduce((acc, row) => {
      const entityId = row.partner.entity_id;
      if (!acc[entityId]) acc[entityId] = [];
      acc[entityId].push(row);
      return acc;
    }, {} as Record<number, typeof filteredRows>);
  }, [filteredRows]);

  return {
    dateRange,
    groupedByEntity,
  };
};
