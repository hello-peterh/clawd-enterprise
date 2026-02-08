import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      role: string;
      organizationId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    organizationId?: string | null;
  }
}
