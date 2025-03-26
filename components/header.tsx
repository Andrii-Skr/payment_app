import { Logout, TabTitle } from "@/components/shared";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

type Props = {
  className?: string;
};

const Header: React.FC<Props> = ({ className }) => {
  return (
    <header className={cn("",className)}>
      <TabTitle className="" />
      <Logout className={"absolute top-1 right-10"} />

    </header>
  );
};

export { Header };
