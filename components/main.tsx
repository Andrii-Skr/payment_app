import { TabsList } from "@/components/shared";

type Props = {
  className?: string;
};

const Main: React.FC<Props> = ({ className }) => {
  return (
    <main className={className}>
      <TabsList />
    </main>
  );
};

export { Main };
