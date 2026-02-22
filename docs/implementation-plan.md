# Clawd Enterprise -- Implementation Plan

## Context

OpenClaw is a mature, self-hosted personal AI assistant with 30+ channel integrations, 88+ gateway API methods, and a full-featured Lit-based control UI. It's designed as a **single-user** tool.

**Clawd Enterprise** transforms it into a **multi-user, enterprise-grade** product by adding:
- Authentication & authorization (multi-user with RBAC)
- A polished React dashboard (separate from the existing Lit UI)
- Enterprise security features (audit logging, SSO, secrets management)
- Full rebrand

The fork is at `https://github.com/hello-peterh/clawd-enterprise`, cloned locally.

---

## Phase 1: Project Setup & Dashboard Shell

**Goal**: New Next.js app running in the monorepo with login and empty dashboard layout.

### 1.1 Create `dashboard/` workspace
- Scaffold Next.js 15 app with TypeScript + Tailwind v4 in `dashboard/`
- Add `dashboard` to `pnpm-workspace.yaml`
- Add convenience scripts to root `package.json`: `dashboard:dev`, `dashboard:build`

**Files to modify:**
- `pnpm-workspace.yaml` -- add `- dashboard`
- `package.json` -- add dashboard scripts
- `dashboard/` -- new directory (Next.js scaffold)

### 1.2 Initialize UI component library
- Install and init **shadcn/ui** (generates source code, not a black-box dependency)
- Includes Tailwind CSS v4, Radix UI primitives
- Set up base theme with Clawd Enterprise branding colors

### 1.3 Set up database
- Add **PostgreSQL 16** container to `docker-compose.yml`
- Install **Prisma ORM** in `dashboard/`
- Create schema: `User`, `Account`, `Session`, `VerificationToken`, `AuditLog`, `Organization`
- Run initial migration

**Files to modify:**
- `docker-compose.yml` -- add `postgres` service
- `dashboard/prisma/schema.prisma` -- new file

### 1.4 Set up authentication
- Install **NextAuth.js v5 (Auth.js)** with Prisma adapter
- Configure email/password credentials provider (Phase 1)
- Add Next.js middleware for route protection
- Build login page and initial admin setup page

**Why NextAuth v5 over alternatives:**
- Runs inside Next.js (no separate server like Keycloak's JVM)
- Native App Router support
- Enterprise SSO providers available for later phases
- Beginner-friendly -- least code to maintain

**New files:**
- `dashboard/src/lib/auth.ts` -- NextAuth config
- `dashboard/src/lib/db.ts` -- Prisma client singleton
- `dashboard/src/app/(public)/login/page.tsx`
- `dashboard/src/app/(public)/setup/page.tsx`
- `dashboard/src/middleware.ts`

### 1.5 Build dashboard shell layout
- Sidebar navigation (Dashboard, Users, Channels, Analytics, Audit Log, Settings)
- Top bar with user avatar, org name, logout
- Responsive (collapsible sidebar on mobile)
- Dark mode support

**New files:**
- `dashboard/src/components/dashboard/sidebar.tsx`
- `dashboard/src/components/dashboard/top-bar.tsx`
- `dashboard/src/app/(auth)/layout.tsx`
- `dashboard/src/app/(auth)/dashboard/page.tsx` (placeholder)

### 1.6 Docker integration
- Add `clawd-dashboard` service to `docker-compose.yml` (port 3000)
- Configure `DATABASE_URL` and `NEXTAUTH_SECRET` env vars
- Gateway communication via `OPENCLAW_GATEWAY_TOKEN` (server-side only)

**Files to modify:**
- `docker-compose.yml` -- add dashboard + postgres services

---

## Phase 2: Core Features

**Goal**: Dashboard talks to the gateway and is genuinely useful.

### 2.1 Gateway API client
- Server-side HTTP/WebSocket client in `dashboard/src/lib/api-client.ts`
- Uses existing gateway token auth from `src/gateway/auth.ts` (env: `OPENCLAW_GATEWAY_TOKEN`)
- **BFF pattern**: browser talks to Next.js, Next.js talks to gateway -- credentials never reach browser

### 2.2 tRPC setup
- Install **tRPC v11** for end-to-end type-safe API layer
- Define routers: `dashboard`, `users`, `channels`, `analytics`, `audit`, `settings`
- Auth + RBAC middleware on every procedure

**New files:**
- `dashboard/src/lib/trpc/` -- router definitions
- `dashboard/src/app/api/trpc/[trpc]/route.ts`

### 2.3 RBAC system
- Four roles: `SUPER_ADMIN`, `ORG_ADMIN`, `OPERATOR`, `VIEWER`
- Permission enum mapped to roles (e.g., `channels:start`, `users:invite`)
- Enforced at 3 layers: Next.js middleware, tRPC middleware, UI conditional rendering

**New files:**
- `dashboard/src/lib/rbac.ts` -- permission definitions and `hasPermission()` utility

### 2.4 Dashboard pages
Build out the six main pages, each backed by tRPC procedures calling the gateway:

| Page | Gateway methods used | Features |
|------|---------------------|----------|
| **Dashboard** | `health`, `status`, `usage.status` | Overview cards, system health, activity feed |
| **Users** | New enterprise endpoints | User table, invite, role assignment, disable |
| **Channels** | `config.get`, channel status methods | Channel grid, start/stop, configuration |
| **Analytics** | `usage.cost`, `usage.status` | Charts (Recharts): message volume, model usage |
| **Audit Log** | New `AuditLog` table queries | Searchable/filterable table (TanStack Table) |
| **Settings** | `config.get`, `config.set` | General, security, model config forms |

### 2.5 Audit logging
- `logAudit()` helper called on every tRPC mutation
- Stores: who, what action, when, from which IP, details (JSONB)
- Extends (not replaces) existing security scanner in `src/security/audit.ts`

**New files:**
- `dashboard/src/lib/audit.ts`

---

## Phase 3: Polish & Rebrand

**Goal**: Production-quality, polished product.

### 3.1 UI polish
- Dark mode toggle
- Loading states, error boundaries, empty states
- Toast notifications for actions
- Responsive design pass

### 3.2 Security hardening
- Rate limiting on auth endpoints (`@upstash/ratelimit` or in-memory)
- Security headers in `next.config.ts` (HSTS, CSP, X-Frame-Options)
- Input validation with Zod on all tRPC procedures (Zod already in project)
- CSRF protection (built into NextAuth v5)

### 3.3 OAuth providers
- Add Google and Microsoft Azure AD OAuth
- Prep for SAML SSO (Phase 4)

### 3.4 Rebrand
- Replace "OpenClaw" branding with "Clawd Enterprise" in dashboard
- New logo/favicon in dashboard
- Update README, package.json name/description

---

## Phase 4: Enterprise Differentiation (Future)

- SAML SSO (Okta, Azure AD federation)
- Multi-organization tenant isolation
- API key management for programmatic access
- Webhook/event system
- Backup and restore
- Kubernetes Helm chart
- E2E test suite (Playwright)

---

## Tech Stack Summary

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend framework | Next.js 15 + React | Industry standard for enterprise dashboards |
| Language | TypeScript | Already used throughout the project |
| Components | shadcn/ui + Radix UI | Source-code ownership, accessible, beautiful |
| Styling | Tailwind CSS v4 | Comes with shadcn/ui, utility-first |
| API layer | tRPC v11 | End-to-end type safety, no codegen |
| Auth | NextAuth v5 (Auth.js) | Native Next.js, beginner-friendly, SSO-ready |
| Database | PostgreSQL 16 | Multi-user concurrency, JSONB, industry standard |
| ORM | Prisma | Declarative schema, type-safe queries, Studio GUI |
| State management | Zustand (client) + RSC (server) | Minimal boilerplate, ~1KB |
| Charts | Recharts | Popular, works well with shadcn/ui style |
| Tables | TanStack Table | shadcn/ui integration, built-in sort/filter |
| Forms | React Hook Form + Zod | Industry standard, shares Zod schemas with API |

---

## Key Existing Files (Integration Points)

| File | Role |
|------|------|
| `src/gateway/auth.ts` | Token/password/Tailscale auth -- dashboard reuses server-side |
| `src/gateway/server-http.ts` | HTTP request pipeline -- enterprise routes mount here |
| `src/gateway/server-methods-list.ts` | 88+ RPC methods the dashboard will call |
| `src/gateway/origin-check.ts` | Origin validation pattern to follow |
| `src/security/audit.ts` | Existing security scanner -- dashboard surfaces findings |
| `docker-compose.yml` | Add postgres + dashboard services |
| `pnpm-workspace.yaml` | Add `dashboard` entry |
| `ui/` | Existing Lit UI -- kept as-is, not replaced |

---

## Verification

After each phase, verify by:

1. **Phase 1**: `pnpm install && pnpm dashboard:dev` -- login page loads, can create admin account, see empty dashboard shell. `docker compose up` starts all 3 services.
2. **Phase 2**: Dashboard shows live gateway data. Can manage users/channels. Audit log records actions. RBAC blocks unauthorized actions.
3. **Phase 3**: OAuth login works. Dark mode toggles. Security headers present (`curl -I`). Rebrand visible throughout.

---

## Implementation Order

We start with **Phase 1** -- the foundation. Each step builds on the last:

1. Scaffold Next.js in `dashboard/` + wire into monorepo
2. Add PostgreSQL + Prisma schema
3. Set up NextAuth with login/setup pages
4. Build the dashboard shell layout (sidebar + top bar)
5. Wire up Docker Compose

This gives a working, deployable skeleton before adding any business logic.
