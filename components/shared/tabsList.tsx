"use client";
import { usePathname } from "next/navigation";
import { AddInfoList } from "@/components/add-info/";
import { AutoPaymentTable, PaymentSchedule } from "@/components/shared";
import { cn } from "@/lib/utils";
import { EntityList } from "../payment-schedule/entityList";
import { Tabs, TabsContent } from "../ui/tabs";
import { Container } from "./container";

type Props = {
  className?: string;
};

export const TabsList: React.FC<Props> = ({ className }) => {
  const pathname = usePathname();

  return (
    <Container className={cn("", className)}>
      <Tabs value={pathname}>
        <TabsContent value="/create">
          <EntityList />
        </TabsContent>
        <TabsContent value="/view">
          <PaymentSchedule />
        </TabsContent>
        <TabsContent value="/regular">
          <AutoPaymentTable />
        </TabsContent>
        <TabsContent value="/add">
          <AddInfoList />
        </TabsContent>
      </Tabs>
    </Container>
  );
};
