"use client";

import { useShallow } from "zustand/shallow";
import { SampleSection } from "@/components/add-info";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAddInfoStore } from "@/store/addInfoStore";
import { EntitySection } from "./sections/entitySection";
import { PartnerSection } from "./sections/partnerSection";
import { UserSection } from "./sections/userSection";

export const AddInfoList = () => {
  const { activeTab, setActiveTab, hasHydrated } = useAddInfoStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
      hasHydrated: state.hasHydrated,
    })),
  );

  if (!hasHydrated) {
    return <Card className="flex h-full min-h-[28rem] overflow-hidden opacity-0" aria-hidden="true" />;
  }

  return (
    <Card className="flex h-full min-h-[28rem] overflow-hidden">
      <aside className="flex w-56 shrink-0 flex-col gap-2 border-r p-4">
        <Button
          variant={activeTab === "entity" ? "default" : "ghost"}
          className="justify-start"
          onClick={() => setActiveTab("entity")}
        >
          ЮрЛицо
        </Button>
        <Button
          variant={activeTab === "partner" ? "default" : "ghost"}
          className="justify-start"
          onClick={() => setActiveTab("partner")}
        >
          Контрагент
        </Button>
        <Button
          variant={activeTab === "user" ? "default" : "ghost"}
          className="justify-start"
          onClick={() => setActiveTab("user")}
        >
          Пользователи
        </Button>
        <Button
          variant={activeTab === "sample" ? "default" : "ghost"}
          className="justify-start"
          onClick={() => setActiveTab("sample")}
        >
          Шаблоны
        </Button>
      </aside>

      {/* -------- content -------- */}
      <main className="flex-1 overflow-auto p-6">
        {activeTab === "entity" && <EntitySection />}
        {activeTab === "partner" && <PartnerSection />}
        {activeTab === "user" && <UserSection />}
        {activeTab === "sample" && <SampleSection />}
      </main>
    </Card>
  );
};
