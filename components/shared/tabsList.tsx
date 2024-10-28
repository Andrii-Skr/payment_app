"use client"
import { Tabs, TabsContent} from "../ui/tabs";
import { Container } from "./container";
import { EntityLIst } from "./entityList";
import { usePathname } from "next/navigation";

type Props = {
  className?: string;
};

export const TabsList: React.FC<Props> = ({ className }) => {
  const pathname = usePathname()

  return (

      <Container className={className}>
      <Tabs value={pathname}>
          <TabsContent value="/create">
            <EntityLIst/>
          </TabsContent>
          <TabsContent value="/view">Change your password here.</TabsContent>
          <TabsContent value="/add">Служебная вкладка для добавление в базу Юр лица и информации о нем</TabsContent>
        </Tabs>
      </Container>

  );
};
