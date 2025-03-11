"use client";

import { EntityTable } from "@/components/shared";
import { Button } from "@/components/ui";
import { apiClient } from "@/services/api-client";
import { useEntityScheduleStore } from "@/store/store";
import React from "react";

type SpecDocType = {
  id: number;
  pay_sum: number;
  expected_date: string; // ISO-формат даты
  dead_line_date: string; // ISO-формат даты
  paid_date: string;
  is_paid: boolean;
};

type DocumentType = {
  id: number;
  partner_id: number;
  account_number: string;
  date: string;
  bank_account: string;
  account_sum: number;
  partners: {
    id: number;
    name: string;
    type: string;
    edrpou: string;
    group: any[];
    entity_id: number;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
  };
  spec_doc: SpecDocType[];
};

type EntityType = {
  id: number;
  name: string;
  documents: DocumentType[];
};

type Props = {
  className?: string;
};

export const PaymentSchedule: React.FC<Props> = ({ className }) => {
  const [entities, setEntities] = React.useState<EntityType[] | []>([]);

  React.useEffect(() => {
    apiClient.entity.entitySchedule().then((data) => {
      setEntities(data);
    });
  }, []);

  const { expandedEntities, toggleEntity } = useEntityScheduleStore();

  return (
    // <div><aside></aside>
    // <PaymentTable partnerNameFilter={""} onlyActive={false}/></div>

    <div className="flex">
      <aside className="w-64 border-r border-gray-300 p-4 min-w-[200px] ml-[-60]">
        {entities.map((entity) => (
          <div key={entity.id} className="mb-2">
            <Button
              className="w-full p-2 bg-blue-500 text-white rounded"
              onClick={() => toggleEntity(entity.id)}
            >
              {entity.name}
            </Button>
          </div>
        ))}
      </aside>
      <main className="flex-1 p-4">
        {entities.map((entity) => {
            return (
              <div key={entity.id} className="mb-4">
                {expandedEntities.includes(entity.id) && (

                  <EntityTable documents={entity.documents} />
                )}
              </div>
          );
        })}
      </main>
    </div>
  );
};
