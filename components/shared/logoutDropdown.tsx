"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useSession } from "next-auth/react";
import { logoutAndReset } from "@/lib/utils/logoutAndReset";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

export function LogoutDropdown() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") return null;

  return (
    <div className="absolute top-2 right-5 gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Привет, {session?.user?.name ?? "Гость"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => logoutAndReset("/")}
            className="text-red-500"
          >
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
