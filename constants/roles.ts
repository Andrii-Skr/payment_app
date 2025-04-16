export const Roles = {
  ADMIN: "admin",
  USER: "user",
  MANAGER: "manager",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
