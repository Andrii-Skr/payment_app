// components/Sidebar.tsx
"use client";

import React from "react";
import SidebarButton from "@/components/add-info/sidebarButton";

type SectionKey = "entity" | "partner" | "user" | "sample";

interface Props {
  children: {
    entity: React.ReactNode;
    partner: React.ReactNode;
    user: React.ReactNode;
    sample: React.ReactNode;
  };
}

export default function Sidebar({ children }: Props) {
  const [active, setActive] = React.useState<SectionKey>("entity");

  return (
    <>
      <aside className="w-60 shrink-0 border-r bg-gray-50 p-4">
        <nav className="flex flex-col gap-2">
          <SidebarButton active={active === "entity"} onClick={() => setActive("entity")} label="ЮрЛицо" />
          <SidebarButton active={active === "partner"} onClick={() => setActive("partner")} label="Контрагент" />
          <SidebarButton active={active === "user"} onClick={() => setActive("user")} label="Пользователи" />
          <SidebarButton active={active === "sample"} onClick={() => setActive("sample")} label="Шаблоны" />
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">{children[active]}</main>
    </>
  );
}
