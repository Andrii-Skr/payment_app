import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  className?: string;
};

export const ContainerGrid: React.FC<React.PropsWithChildren<Props>> = ({
  className,
  children,
}) => {
  return <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full", className)}>{children}</div>;
};
