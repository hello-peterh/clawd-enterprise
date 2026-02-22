import { router, protectedProcedure } from "../trpc";
import { gateway } from "@/lib/api-client";

export const dashboardRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userCount = await ctx.db.user.count();

    let gatewayHealth = null;
    let gatewayStats = null;

    try {
      gatewayHealth = await gateway.getSystemHealth();
      gatewayStats = await gateway.getStats();
    } catch {
      // Gateway not available - return partial data
    }

    const recentActivity = await ctx.db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return {
      userCount,
      gatewayHealth,
      gatewayStats,
      recentActivity: recentActivity.map((log: { id: string; action: string; target: string | null; user: { name: string | null; email: string }; createdAt: Date }) => ({
        id: log.id,
        action: log.action,
        target: log.target,
        userName: log.user.name ?? log.user.email,
        createdAt: log.createdAt,
      })),
    };
  }),

  getGettingStarted: protectedProcedure.query(async ({ ctx }) => {
    const userCount = await ctx.db.user.count();
    let gatewayConnected = false;
    let channelCount = 0;

    try {
      await gateway.getSystemHealth();
      gatewayConnected = true;
      const channels = await gateway.getChannels();
      channelCount = Array.isArray(channels) ? channels.length : 0;
    } catch {
      // Gateway not available
    }

    return {
      adminCreated: userCount > 0,
      gatewayConnected,
      channelConnected: channelCount > 0,
      teamInvited: userCount > 1,
    };
  }),
});
