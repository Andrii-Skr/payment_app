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
  const isViewTab = pathname === withLocale("/view");

  return (
    <Container className={cn(isViewTab && "flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <Tabs
        value={pathname}
        className={cn(
          isViewTab && "flex flex-1 flex-col items-center",
          isViewTab && "h-[calc(100dvh-40px)] min-h-0 max-h-[calc(100dvh-40px)] overflow-hidden",
        )}
      >
        <TabsContent value={withLocale("/create")}>
          <EntityList />
        </TabsContent>
        <TabsContent value={withLocale("/view")} className="mt-2 flex min-h-0 flex-1 overflow-hidden">
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
