import { TabTitle } from "@/components/shared";

type Props = {
  className?: string;
};

const Header: React.FC<Props> = ({ className }) => {
  return (
    <header className={className}>
      <TabTitle className="mb-5" />
    </header>
  );
};

export { Header };
