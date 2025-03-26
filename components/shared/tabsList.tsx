"use client";
import { AddInfoList } from "@/components/shared/addInfoList";
import { Tabs, TabsContent } from "../ui/tabs";
import { Container } from "./container";
import { EntityLIst } from "./entityList";
import { usePathname } from "next/navigation";
import { PaymentSchedule } from "@/components/shared";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export const TabsList: React.FC<Props> = ({ className }) => {
  const pathname = usePathname();

  return (
    <Container className={cn('',className)}>
      <Tabs value={pathname}>
        <TabsContent value="/create">
          <EntityLIst />
        </TabsContent>
        <TabsContent value="/view" >
          <PaymentSchedule />
        </TabsContent>
        <TabsContent value="/regular" >
          <p>Регулярные платежи</p>
        </TabsContent>
        <TabsContent value="/add">
          <AddInfoList />
        </TabsContent>
      </Tabs>
    </Container>
  );
};
