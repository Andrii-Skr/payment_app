// components/shared/addInfoList.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EntitySection } from "./sections/entitySection";
import { PartnerSection } from "./sections/partnerSection";
import { SampleSection } from "@/components/add-info";
import UserSection     from './sections/UserSection';

type Tab = "entity" | "partner" | "user" | "sample";

export const AddInfoList = () => {
  const [tab, setTab] = useState<Tab>("entity");

  return (
    <Card className="flex h-full min-h-[28rem] overflow-hidden">
      {/* -------- sidebar -------- */}
      <aside className="flex w-56 shrink-0 flex-col gap-2 border-r p-4">
        <Button
          variant={tab === "entity" ? "default" : "ghost"}
          className="justify-start"
          onClick={() => setTab("entity")}
        >
          ЮрЛицо
        </Button>
        <Button
          variant={tab === "partner" ? "default" : "ghost"}
          className="justify-start"
          onClick={() => setTab("partner")}
        >
          Контрагент
        </Button>
        <Button
          variant={tab === "user" ? "default" : "ghost"}
          className="justify-start"
          onClick={() => setTab("user")}
        >
          Пользователи
        </Button>
        <Button
          variant={tab === "sample" ? "default" : "ghost"}
          className="justify-start"
          onClick={() => setTab("sample")}
        >
          Шаблоны
        </Button>
      </aside>

      {/* -------- content -------- */}
      <main className="flex-1 overflow-auto p-6">
        {tab === "entity" && <EntitySection />}
        {tab === "partner" && <PartnerSection />}
        {tab === 'user'    && <UserSection />}
        {tab === 'sample' && <SampleSection />}
      </main>
    </Card>
  );
};
