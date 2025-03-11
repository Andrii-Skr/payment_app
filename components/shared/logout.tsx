"use client";

import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  className: string;
};

export const Logout: React.FC<Props> = ({ className }) => {
  return <></>;
  // const { data: session, status } = useSession();
  // const router = useRouter();

  // if (!session) {
  //   router.push("/auth/signin");
  //   return null;
  // }
  // return (
  //   <div
  //     className={cn(
  //       "flex flex-row justify-center items-center gap-5",
  //       className
  //     )}
  //   >
  //     <h1>Привет, {session.user?.name}</h1>
  //     <button
  //       onClick={() => signOut({ callbackUrl: "/" })}
  //       className={"mt-4 bg-red-500 text-white p-2 rounded"}
  //     >
  //       Выйти
  //     </button>
  //   </div>
  // );
};
