import { TabsList } from "@/components/shared";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const Main: React.FC<Props> = ({ className }) => {
  return (
    <main className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <TabsList />
    </main>
  );
};

export { Main };
