"use client";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Container } from "../shared/";
import { usePathname, useRouter } from "next/navigation";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { Roles } from "@/constants/roles";

type Props = {
  className?: string;
};

const tabs = [
  {
    value: "/create",
    label: "Создать Платеж",
  },
  {
    value: "/view",
    label: "Просмотр графика оплат",
  },
  {
    value: "/regular",
    label: "Регулярные платежи",
    allowedRoles: [Roles.ADMIN],
  },
  {
    value: "/add",
    label: "Админка",
    allowedRoles: [Roles.ADMIN],
  },
];

export const TabTitle: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { canAccess } = useAccessControl();

  const handleClick = (value: string) => {
    router.push(value);
  };

  const getActiveTabValue = () => {
    const active = tabs.find((tab) => pathname.startsWith(tab.value));
    return active?.value || "/create";
  };

  const activeTabValue = getActiveTabValue();

  const visibleTabs = tabs.filter((tab) => {
    if (!tab.allowedRoles) return true;
    return canAccess(tab.allowedRoles);
  });

  return (
    <Container className={className}>
      <Tabs
        defaultValue="/create"
        value={activeTabValue}
        onValueChange={handleClick}
      >
        <TabsList>
          {visibleTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              onClick={() => handleClick(tab.value)}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </Container>
  );
};
