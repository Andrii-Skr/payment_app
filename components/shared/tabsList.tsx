"use client";
import { usePathname } from "next/navigation";
import { AddInfoList } from "@/components/add-info/";
import { AutoPaymentTable, PaymentSchedule } from "@/components/shared";
import { useLocalePath } from "@/lib/hooks/useLocalePath";
import { cn } from "@/lib/utils";
import { EntityList } from "../payment-schedule/entityList";
import { Tabs, TabsContent } from "../ui/tabs";
import { Container } from "./container";

type Props = {
  className?: string;
};

export const TabsList: React.FC<Props> = ({ className }) => {
  const pathname = usePathname();
  const { withLocale } = useLocalePath();

  return (
    <Container className={cn("", className)}>
      <Tabs value={pathname}>
        <TabsContent value={withLocale("/create")}>
          <EntityList />
        </TabsContent>
        <TabsContent value={withLocale("/view")}>
          <PaymentSchedule />
        </TabsContent>
        <TabsContent value={withLocale("/regular")}>
          <AutoPaymentTable />
        </TabsContent>
        <TabsContent value={withLocale("/add")}>
          <AddInfoList />
        </TabsContent>
      </Tabs>
    </Container>
  );
};
