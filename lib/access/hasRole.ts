/**
 * Проверка роли пользователя.
 * @param actualRole - роль из токена (`token.role`)
 * @param allowed - строка или массив допустимых ролей
 * @returns `true`, если роль совпадает
 */
export function hasRole(
  actualRole: string | undefined,
  allowed: string | string[]
): boolean {
  if (!actualRole) return false;

  if (Array.isArray(allowed)) {
    return allowed.includes(actualRole);
  }

  return actualRole === allowed;
}
