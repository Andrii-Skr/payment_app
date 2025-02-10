"use client";

import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

type Props = {
    className: string
}

export const Logout: React.FC<Props> = ({ className}) =>{
  return (
    <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn("mt-4 bg-red-500 text-white p-2 rounded",className)}
    >
      Выйти
    </button>
  );
}
