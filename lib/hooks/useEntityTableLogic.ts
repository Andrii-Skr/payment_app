import { useEffect, useMemo, useState } from "react";
import type { DocumentType } from "@/types/types";

export const useEntityTableLogic = ({
  documents,
  entities,
  startDate,
  period,
  selectedEntity,
  partnerFilter,
  collator,
}: {
  documents: DocumentType[];
  entities: { id: number; sort_order: number | null }[];
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

  const [formattedDateRange, setFormattedDateRange] = useState<string[]>([]);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Europe/Kyiv",
    });
    setFormattedDateRange(dateRange.map((d) => formatter.format(d)));
  }, [dateRange]);

  const entityOrderMap = useMemo(() => {
    const map = new Map<number, number>();
    entities.forEach((e) => {
      map.set(e.id, e.sort_order ?? 0);
    });
    return map;
  }, [entities]);

  const partnersMap = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        const key = `${doc.entity_id}:${doc.partner.id}`;
        if (!acc[key]) {
          acc[key] = {
            partner: doc.partner,
            entity_id: doc.entity_id,
            documents: [doc],
          };
        } else {
          acc[key].documents.push(doc);
        }
        return acc;
      },
      {} as Record<
        string,
        {
          partner: DocumentType["partner"];
          entity_id: number;
          documents: DocumentType[];
        }
      >,
    );
  }, [documents]);

  const partnerRows = useMemo(() => {
    const rows = Object.values(partnersMap);
    rows.sort((a, b) => {
      const orderA = entityOrderMap.get(a.entity_id) ?? 0;
      const orderB = entityOrderMap.get(b.entity_id) ?? 0;
      return orderA !== orderB ? orderA - orderB : collator.compare(a.partner.short_name, b.partner.short_name);
    });
    return rows;
  }, [partnersMap, collator, entityOrderMap]);

  const filteredRows = useMemo(() => {
    return partnerRows.filter((row) => {
      const entityMatch = selectedEntity === "all" || row.entity_id === selectedEntity;
      const nameMatch = row.partner.short_name.toLowerCase().includes(partnerFilter.toLowerCase());
      return entityMatch && nameMatch;
    });
  }, [partnerRows, selectedEntity, partnerFilter]);

  const groupedByEntity = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        const entityId = row.entity_id;
        if (!acc[entityId]) acc[entityId] = [];
        acc[entityId].push(row);
        return acc;
      },
      {} as Record<number, typeof filteredRows>,
    );
  }, [filteredRows]);

  return {
    dateRange,
    formattedDateRange,
    groupedByEntity,
  };
};
