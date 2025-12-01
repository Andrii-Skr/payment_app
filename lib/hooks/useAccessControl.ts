import { useSession } from "next-auth/react";
import type { Role } from "@/constants/roles";
import { hasRole } from "@/lib/access/hasRole";

export const useAccessControl = () => {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const canAccess = (allowedRoles: Role | Role[]) => {
    return hasRole(role, allowedRoles);
  };

  return { canAccess, role };
};
