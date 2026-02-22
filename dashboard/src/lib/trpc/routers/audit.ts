import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { requirePermission } from "@/lib/rbac";

export const auditRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(25),
        action: z.string().optional(),
        userId: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.session.user.role, "audit:view");

      const where: Record<string, unknown> = {};

      if (input.action) {
        where.action = { contains: input.action, mode: "insensitive" };
      }
      if (input.userId) {
        where.userId = input.userId;
      }
      if (input.dateFrom || input.dateTo) {
        where.createdAt = {
          ...(input.dateFrom && { gte: new Date(input.dateFrom) }),
          ...(input.dateTo && { lte: new Date(input.dateTo) }),
        };
      }

      const items = await ctx.db.auditLog.findMany({
        where,
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: items.map((item: { id: string; action: string; target: string | null; details: unknown; ipAddress: string | null; user: { name: string | null; email: string }; createdAt: Date }) => ({
          id: item.id,
          action: item.action,
          target: item.target,
          details: item.details as Record<string, unknown> | null,
          ipAddress: item.ipAddress,
          userName: item.user.name ?? item.user.email,
          userEmail: item.user.email,
          createdAt: item.createdAt,
        })),
        nextCursor,
      };
    }),

  getActions: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx.session.user.role, "audit:view");

    const actions = await ctx.db.auditLog.findMany({
      select: { action: true },
      distinct: ["action"],
      orderBy: { action: "asc" },
    });

    return actions.map((a: { action: string }) => a.action);
  }),

  getUsers: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx.session.user.role, "audit:view");

    const users = await ctx.db.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    return users.map((u: { id: string; name: string | null; email: string }) => ({
      id: u.id,
      label: u.name ?? u.email,
    }));
  }),
});
