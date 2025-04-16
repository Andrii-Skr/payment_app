import { Role } from "@/constants/roles";

/**
 * Проверка роли пользователя.
 * @param actualRole - роль из токена (`token.role`)
 * @param allowed - строка или массив допустимых ролей
 * @returns `true`, если роль совпадает
 */
export function hasRole(
  actualRole: string | undefined,
  allowed: Role | Role[]
): boolean {
  if (!actualRole) return false;

  if (Array.isArray(allowed)) {
    return allowed.includes(actualRole as Role);
  }

  return actualRole === allowed;
}
