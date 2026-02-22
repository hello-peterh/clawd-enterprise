export const PERMISSIONS = {
  "users:list": true,
  "users:create": true,
  "users:update": true,
  "users:delete": true,
  "channels:list": true,
  "channels:configure": true,
  "channels:start": true,
  "channels:stop": true,
  "sessions:list": true,
  "sessions:view": true,
  "sessions:delete": true,
  "audit:view": true,
  "settings:view": true,
  "settings:update": true,
  "analytics:view": true,
} as const;

export type Permission = keyof typeof PERMISSIONS;

export type UserRole = "SUPER_ADMIN" | "ORG_ADMIN" | "OPERATOR" | "VIEWER";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: Object.keys(PERMISSIONS) as Permission[],
  ORG_ADMIN: [
    "users:list", "users:create", "users:update",
    "channels:list", "channels:configure", "channels:start", "channels:stop",
    "sessions:list", "sessions:view", "sessions:delete",
    "audit:view", "settings:view", "settings:update", "analytics:view",
  ],
  OPERATOR: [
    "channels:list", "channels:start", "channels:stop",
    "sessions:list", "sessions:view", "analytics:view",
  ],
  VIEWER: ["channels:list", "sessions:list", "analytics:view"],
};

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role as UserRole]?.includes(permission) ?? false;
}

export function getPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role as UserRole] ?? [];
}
