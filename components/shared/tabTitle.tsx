"use client"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Container } from "../shared/";
import { usePathname, useRouter } from "next/navigation";


type Props = {
  className?: string;
};

export const TabTitle:React.FC<Props> = ({className}) => {

  const router = useRouter()
  const pathname = usePathname()

  const handleClick = (value: string) => {
    router.push(`${value}`);
  };
    return (

      <Container className={ className}>
      <Tabs defaultValue="/create" value={pathname} onValueChange={handleClick}>
          <TabsList>
            <TabsTrigger value="/create">Создать Платеж</TabsTrigger>
            <TabsTrigger value="/view">Просмотр графика оплат</TabsTrigger>
            <TabsTrigger value="/add">Добавление чего-то там</TabsTrigger>
          </TabsList>
        </Tabs>
      </Container>
  )
}

