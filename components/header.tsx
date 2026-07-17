import { LogoutDropdown, TabTitle } from "@/components/shared";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const Header: React.FC<Props> = ({ className }) => {
  return (
    <header className={cn("sticky top-0 z-50 shrink-0 bg-background", className)}>
      <TabTitle className="" />
      <LogoutDropdown />
    </header>
  );
};

export { Header };
