import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { gateway } from "@/lib/api-client";
import { logAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/rbac";

export const channelsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx.session.user.role, "channels:list");

    try {
      const channels = await gateway.getChannels();
      return { channels: Array.isArray(channels) ? channels : [], connected: true };
    } catch {
      // Gateway not available - return mock data for development
      return {
        channels: [
          {
            id: "slack-main",
            name: "Slack - Main Workspace",
            type: "slack",
            status: "stopped",
            messageCount: 0,
          },
          {
            id: "discord-support",
            name: "Discord - Support Server",
            type: "discord",
            status: "stopped",
            messageCount: 0,
          },
          {
            id: "teams-corp",
            name: "Microsoft Teams - Corporate",
            type: "teams",
            status: "stopped",
            messageCount: 0,
          },
          {
            id: "telegram-bot",
            name: "Telegram - Bot Channel",
            type: "telegram",
            status: "stopped",
            messageCount: 0,
          },
          {
            id: "whatsapp-support",
            name: "WhatsApp - Customer Support",
            type: "whatsapp",
            status: "stopped",
            messageCount: 0,
          },
          {
            id: "matrix-dev",
            name: "Matrix - Dev Room",
            type: "matrix",
            status: "stopped",
            messageCount: 0,
          },
        ],
        connected: false,
      };
    }
  }),

  getStatus: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx }) => {
      requirePermission(ctx.session.user.role, "channels:list");

      try {
        return await gateway.getChannelStatus(ctx.session.user.id);
      } catch {
        return { status: "unknown", error: "Gateway not available" };
      }
    }),

  start: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.session.user.role, "channels:start");

      try {
        const result = await gateway.startChannel(input.id);

        await logAudit({
          userId: ctx.session.user.id,
          action: "channel.started",
          target: input.id,
        });

        return result;
      } catch (error) {
        await logAudit({
          userId: ctx.session.user.id,
          action: "channel.start_failed",
          target: input.id,
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
        throw error;
      }
    }),

  stop: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.session.user.role, "channels:stop");

      try {
        const result = await gateway.stopChannel(input.id);

        await logAudit({
          userId: ctx.session.user.id,
          action: "channel.stopped",
          target: input.id,
        });

        return result;
      } catch (error) {
        await logAudit({
          userId: ctx.session.user.id,
          action: "channel.stop_failed",
          target: input.id,
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
        throw error;
      }
    }),
});
