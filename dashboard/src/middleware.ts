export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/((?!login|setup|api/auth|api/setup|_next/static|_next/image|favicon.ico).*)",
  ],
};
