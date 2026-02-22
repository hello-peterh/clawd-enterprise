import "next-auth";

export type UserRole = "SUPER_ADMIN" | "ORG_ADMIN" | "OPERATOR" | "VIEWER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      role: UserRole;
      organizationId: string | null;
    };
  }

  interface User {
    role?: UserRole;
    organizationId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    organizationId?: string | null;
  }
}
