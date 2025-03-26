"use client";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Container } from "../shared/";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  className?: string;
};

export const TabTitle: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (value: string) => {
    router.push(`${value}`);
  };

  const getActiveTabValue = () => {
    if (pathname.startsWith("/create")) {
      return "/create";
    } else if (pathname.startsWith("/view")) {
      return "/view";
    } else if (pathname.startsWith("/add")) {
      return "/add";
    } else if (pathname.startsWith("/regular")) {
      return "/regular";
    }
    return "/create";
  };

  const activeTabValue = getActiveTabValue();

  return (
    <Container className={className}>
      <Tabs
        defaultValue="/create"
        value={activeTabValue}
        onValueChange={handleClick}
      >
        <TabsList>
          <TabsTrigger value="/create">Создать Платеж</TabsTrigger>
          <TabsTrigger value="/view">Просмотр графика оплат</TabsTrigger>
          <TabsTrigger value="/regular">
            Регулярные платежи
          </TabsTrigger>
          <TabsTrigger value="/add">Админка</TabsTrigger>
        </TabsList>
      </Tabs>
    </Container>
  );
};
