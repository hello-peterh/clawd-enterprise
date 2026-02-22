import { router } from "./trpc";
import { dashboardRouter } from "./routers/dashboard";
import { usersRouter } from "./routers/users";
import { channelsRouter } from "./routers/channels";
import { auditRouter } from "./routers/audit";

export const appRouter = router({
  dashboard: dashboardRouter,
  users: usersRouter,
  channels: channelsRouter,
  audit: auditRouter,
});

export type AppRouter = typeof appRouter;
