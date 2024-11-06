"use client";
import { AddInfoList } from "@/components/shared/addInfoList";
import { Tabs, TabsContent } from "../ui/tabs";
import { Container } from "./container";
import { EntityLIst } from "./entityList";
import { usePathname } from "next/navigation";

type Props = {
  className?: string;
};

export const TabsList: React.FC<Props> = ({ className }) => {
  const pathname = usePathname();

  return (
    <Container className={className}>
      <Tabs value={pathname}>
        <TabsContent value="/create">
          <EntityLIst />
        </TabsContent>
        <TabsContent value="/view">Change your password here.</TabsContent>
        <TabsContent value="/add">
          <AddInfoList />
        </TabsContent>
      </Tabs>
    </Container>
  );
};
