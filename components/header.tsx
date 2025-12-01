import { LogoutDropdown, TabTitle } from "@/components/shared";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const Header: React.FC<Props> = ({ className }) => {
  return (
    <header className={cn("", className)}>
      <TabTitle className="" />
      <LogoutDropdown />
    </header>
  );
};

export { Header };
