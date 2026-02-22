import { z } from "zod";
import { hash } from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { logAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/rbac";

export const usersRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        role: z.enum(["SUPER_ADMIN", "ORG_ADMIN", "OPERATOR", "VIEWER"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.session.user.role, "users:list");

      const where: Record<string, unknown> = {};
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
        ];
      }
      if (input.role) {
        where.role = input.role;
      }

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            organizationId: true,
          },
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.perPage,
          take: input.perPage,
        }),
        ctx.db.user.count({ where }),
      ]);

      return {
        users,
        total,
        page: input.page,
        perPage: input.perPage,
        totalPages: Math.ceil(total / input.perPage),
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      requirePermission(ctx.session.user.role, "users:list");

      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          organizationId: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        role: z
          .enum(["SUPER_ADMIN", "ORG_ADMIN", "OPERATOR", "VIEWER"])
          .default("VIEWER"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.session.user.role, "users:create");

      const existing = await ctx.db.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists",
        });
      }

      // Prevent non-super-admins from creating super admins
      if (
        input.role === "SUPER_ADMIN" &&
        ctx.session.user.role !== "SUPER_ADMIN"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Admins can create other Super Admins",
        });
      }

      const passwordHash = await hash(input.password, 12);

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          role: input.role,
          organizationId: ctx.session.user.organizationId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      await logAudit({
        userId: ctx.session.user.id,
        action: "user.created",
        target: user.id,
        details: { email: user.email, role: user.role },
      });

      return user;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.session.user.role, "users:update");

      const existing = await ctx.db.user.findUnique({
        where: { id: input.id },
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (input.email && input.email !== existing.email) {
        const emailTaken = await ctx.db.user.findUnique({
          where: { email: input.email },
        });
        if (emailTaken) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use",
          });
        }
      }

      const user = await ctx.db.user.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.email && { email: input.email }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      await logAudit({
        userId: ctx.session.user.id,
        action: "user.updated",
        target: user.id,
        details: { changes: { name: input.name, email: input.email } },
      });

      return user;
    }),

  updateRole: adminProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.enum(["SUPER_ADMIN", "ORG_ADMIN", "OPERATOR", "VIEWER"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.session.user.role, "users:update");

      // Prevent non-super-admins from assigning super admin role
      if (
        input.role === "SUPER_ADMIN" &&
        ctx.session.user.role !== "SUPER_ADMIN"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Admins can assign the Super Admin role",
        });
      }

      // Prevent demoting yourself
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot change your own role",
        });
      }

      const user = await ctx.db.user.update({
        where: { id: input.id },
        data: { role: input.role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      await logAudit({
        userId: ctx.session.user.id,
        action: "user.role_changed",
        target: user.id,
        details: { newRole: input.role },
      });

      return user;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx.session.user.role, "users:delete");

      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot delete your own account",
        });
      }

      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: { email: true, role: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Prevent deleting super admins unless you are one
      if (
        user.role === "SUPER_ADMIN" &&
        ctx.session.user.role !== "SUPER_ADMIN"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Admins can delete other Super Admins",
        });
      }

      await ctx.db.user.delete({ where: { id: input.id } });

      await logAudit({
        userId: ctx.session.user.id,
        action: "user.deleted",
        target: input.id,
        details: { email: user.email },
      });

      return { success: true };
    }),
});
