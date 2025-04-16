import { useSession } from "next-auth/react";
import { hasRole } from "@/lib/access/hasRole";
import { Role } from "@/constants/roles";

export const useAccessControl = () => {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const canAccess = (allowedRoles: Role | Role[]) => {
    return hasRole(role, allowedRoles);
  };

  return { canAccess, role };
};
