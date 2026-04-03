"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type Role, Roles } from "@/constants/roles";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { useLocalePath } from "@/lib/hooks/useLocalePath";
import { Container } from "../shared/";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

type Props = {
  className?: string;
};

type TabDefinition = {
  path: string;
  label: string;
  allowedRoles?: Role[];
};

export const TabTitle: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { canAccess } = useAccessControl();
  const { withLocale } = useLocalePath();
  const t = useTranslations("nav");

  const tabs: TabDefinition[] = [
    {
      path: "/create",
      label: t("createPayment"),
    },
    {
      path: "/view",
      label: t("paymentSchedule"),
    },
    {
      path: "/regular",
      label: t("regularPayments"),
      allowedRoles: [Roles.ADMIN],
    },
    {
      path: "/add",
      label: t("adminPanel"),
      allowedRoles: [Roles.ADMIN],
    },
  ];

  const localizedTabs = tabs.map((tab) => ({
    ...tab,
    value: withLocale(tab.path),
  }));

  const handleClick = (value: string) => {
    router.push(value);
  };

  const getActiveTabValue = () => {
    const active = localizedTabs.find((tab) => pathname.startsWith(tab.value));
    return active?.value || withLocale("/create");
  };

  const activeTabValue = getActiveTabValue();

  const visibleTabs = localizedTabs.filter((tab) => {
    if (!tab.allowedRoles) return true;
    return canAccess(tab.allowedRoles);
  });

  return (
    <Container className={className}>
      <Tabs defaultValue={withLocale("/create")} value={activeTabValue} onValueChange={handleClick}>
        <TabsList>
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} onClick={() => handleClick(tab.value)}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </Container>
  );
};
