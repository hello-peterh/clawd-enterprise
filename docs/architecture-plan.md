# Clawd Enterprise -- Architecture Plan

## Executive Summary

This plan transforms OpenClaw (a personal, single-user AI assistant) into Clawd Enterprise: a multi-tenant, enterprise-grade platform with a React/Next.js admin dashboard, robust authentication and authorization, audit logging, and a deployment model suitable for organizations. The plan is structured in four phases, each designed to produce a working, shippable increment.

---

## 1. Project Structure -- Adding Next.js to the Existing Monorepo

### Current layout (observed)

```
clawd-enterprise/
  src/             -- Node.js/TypeScript backend (gateway, channels, agents, security, etc.)
  ui/              -- Existing Lit web components + Vite control panel
  apps/            -- Native apps (Android, iOS, macOS)
  packages/        -- Workspace packages (clawdbot, moltbot)
  extensions/      -- Channel plugins (msteams, matrix, etc.)
  docs/            -- Mintlify docs
  docker-compose.yml
  Dockerfile
  pnpm-workspace.yaml  -- workspaces: ['.', 'ui', 'packages/*', 'extensions/*']
```

### Proposed addition

Add a new workspace called `dashboard/` at the repo root. This keeps it parallel to `ui/` (the existing control panel) and `apps/` (native clients). The Next.js app will be a standalone workspace package inside the monorepo.

```
clawd-enterprise/
  dashboard/                 -- NEW: Next.js enterprise frontend
    package.json
    next.config.ts
    tsconfig.json
    .env.local.example
    prisma/                  -- Prisma schema + migrations
      schema.prisma
      migrations/
    src/
      app/                   -- Next.js App Router (layouts, pages)
        (auth)/              -- Auth-gated route group
          layout.tsx
          dashboard/
            page.tsx
          users/
            page.tsx
          channels/
            page.tsx
          analytics/
            page.tsx
          settings/
            page.tsx
          audit-log/
            page.tsx
        (public)/            -- Public (unauthenticated) pages
          login/
            page.tsx
          setup/
            page.tsx
        api/                 -- Next.js API routes (BFF pattern)
          auth/[...nextauth]/
            route.ts
          trpc/[trpc]/
            route.ts
        layout.tsx           -- Root layout
        globals.css
      components/            -- Shared UI components
        ui/                  -- shadcn/ui generated components
        dashboard/           -- Dashboard-specific composites
        charts/              -- Analytics chart components
      lib/                   -- Shared utilities
        auth.ts              -- NextAuth config
        db.ts                -- Prisma client singleton
        trpc/                -- tRPC router + client setup
        api-client.ts        -- Gateway API client (calls OpenClaw backend)
        rbac.ts              -- Role/permission checking utilities
        audit.ts             -- Audit log helper
      hooks/                 -- Custom React hooks
      types/                 -- Shared TypeScript types
      stores/                -- Zustand stores (lightweight state)
  src/                       -- Existing backend (UNCHANGED initially)
    enterprise/              -- NEW: Enterprise API extensions
      routes/                -- Express/Hono routes for enterprise features
      middleware/             -- Auth middleware, rate limiting
      services/              -- Business logic (users, audit, analytics)
  ui/                        -- Existing Lit control panel (KEPT, not replaced)
```

### pnpm-workspace.yaml change

```yaml
packages:
  - .
  - ui
  - dashboard          # <-- add this
  - packages/*
  - extensions/*
```

### Why this structure

- **Parallel, not replacement**: The existing `ui/` Lit control panel continues to work for users who prefer the lightweight option. The new `dashboard/` is an independent, richer alternative aimed at enterprise administrators.
- **pnpm workspace integration**: The dashboard participates in the monorepo lockfile, so dependency versions stay consistent.
- **Clean separation**: The Next.js app has its own `tsconfig.json` and build pipeline (Next.js handles its own bundling), so it does not interfere with the existing tsdown/vite builds.
- **BFF (Backend for Frontend)**: The Next.js API routes act as a secure intermediary between the browser and the OpenClaw gateway. The browser never talks directly to the gateway; the Next.js server does. This eliminates CORS issues and keeps gateway tokens server-side.

---

## 2. Authentication and Authorization

### Recommendation: **NextAuth.js v5 (Auth.js)**

| Criterion | NextAuth v5 | Keycloak | Lucia |
|---|---|---|---|
| Complexity for beginner | Low | High (Java, separate server) | Medium (manual session logic) |
| Next.js integration | Native (first-party) | Requires adapter | Requires custom integration |
| Enterprise SSO (SAML/OIDC) | Via providers (Azure AD, Okta, Google Workspace) | Built-in | Not built-in |
| Self-hosted | Yes (runs inside Next.js) | Yes (separate JVM process) | Yes |
| Maintenance burden | Low (community-maintained) | High (JVM ops) | Medium (more custom code) |
| Credential login | Yes | Yes | Yes |

**Verdict**: NextAuth.js v5 (now branded "Auth.js") is the right choice. It runs inside the Next.js process, requires no separate infrastructure, supports enterprise identity providers (Azure AD, Okta, Google Workspace OIDC/SAML), and has excellent documentation for beginners.

### Auth architecture

```
Browser --> Next.js App (with NextAuth middleware)
               |
               +--> NextAuth session (JWT or database-backed)
               |
               +--> Prisma adapter (stores users, accounts, sessions in Postgres)
               |
               +--> On authenticated API calls: Next.js server --> OpenClaw Gateway
                    (using server-side gateway token, never exposed to browser)
```

### Supported auth methods (phased)

1. **Phase 1**: Email/password credentials + magic link email
2. **Phase 2**: OAuth providers (Google, GitHub, Microsoft/Azure AD)
3. **Phase 3**: SAML SSO for enterprise (via Auth.js enterprise providers or a shim to an external IdP)

### Session strategy

Use **JWT sessions** for Phase 1 (simpler, no session store needed), then switch to **database sessions** in Phase 2 when you need server-side session revocation for enterprise compliance.

### Key configuration file: `dashboard/src/lib/auth.ts`

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate against Prisma user table
        // Use bcrypt/argon2 for password verification
      },
    }),
    // Phase 2: add Google, Azure AD, etc.
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Attach RBAC role to JWT
        token.orgId = user.orgId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.orgId = token.orgId;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

---

## 3. Security Architecture

### 3a. Role-Based Access Control (RBAC)

#### Role hierarchy

| Role | Description | Permissions |
|---|---|---|
| `super_admin` | Platform owner/operator | Everything. Can manage orgs, billing, global settings. |
| `org_admin` | Organization administrator | Manage users within their org, configure channels, view audit logs, manage sessions. |
| `operator` | Day-to-day operator | Start/stop channels, view dashboards, send messages, manage agent config. |
| `viewer` | Read-only | View dashboards, analytics, and channel status. Cannot change anything. |

#### Permission model

Rather than hard-coding role checks everywhere, define a **permission enum** and map roles to permissions. This makes it easy to add roles later.

```typescript
// dashboard/src/lib/rbac.ts

export const PERMISSIONS = {
  // User management
  "users:list": true,
  "users:create": true,
  "users:update": true,
  "users:delete": true,
  // Channel management
  "channels:list": true,
  "channels:configure": true,
  "channels:start": true,
  "channels:stop": true,
  // Sessions
  "sessions:list": true,
  "sessions:view": true,
  "sessions:delete": true,
  // Audit
  "audit:view": true,
  // Settings
  "settings:view": true,
  "settings:update": true,
  // Analytics
  "analytics:view": true,
} as const;

export type Permission = keyof typeof PERMISSIONS;

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: Object.keys(PERMISSIONS) as Permission[],
  org_admin: [
    "users:list", "users:create", "users:update",
    "channels:list", "channels:configure", "channels:start", "channels:stop",
    "sessions:list", "sessions:view", "sessions:delete",
    "audit:view",
    "settings:view", "settings:update",
    "analytics:view",
  ],
  operator: [
    "channels:list", "channels:start", "channels:stop",
    "sessions:list", "sessions:view",
    "analytics:view",
  ],
  viewer: [
    "channels:list",
    "sessions:list",
    "analytics:view",
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
```

#### Enforcement points

- **Next.js Middleware** (`dashboard/src/middleware.ts`): Redirect unauthenticated users to `/login`. Check role-based route access at the edge.
- **tRPC middleware**: Every tRPC procedure checks the session and the required permission before executing.
- **Server Components**: Use the `auth()` helper to read the session and conditionally render UI.

### 3b. API Security

1. **Gateway communication**: The Next.js server communicates with the OpenClaw gateway using the existing token-based auth (`OPENCLAW_GATEWAY_TOKEN`). This token is stored server-side in environment variables, never sent to the browser.

2. **Rate limiting**: Use `@upstash/ratelimit` (serverless Redis-backed rate limiter) or the simpler `next-rate-limit` package for API routes. Apply stricter limits to auth endpoints (login, password reset).

3. **CSRF protection**: NextAuth v5 includes built-in CSRF protection for all auth endpoints. For custom API routes, use the `Origin` header check pattern (already present in the OpenClaw gateway -- see `src/gateway/origin-check.ts`).

4. **Input validation**: Use **Zod** (already a dependency in the project: `"zod": "^4.3.6"`) for all API input validation. Every tRPC procedure and API route should validate inputs with a Zod schema.

5. **Security headers**: Add a `next.config.ts` security headers block:
   - `Strict-Transport-Security`
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Content-Security-Policy`
   - `Referrer-Policy: strict-origin-when-cross-origin`

### 3c. Audit Logging

The existing `src/security/audit.ts` performs point-in-time security scans. Enterprise needs continuous audit logging: who did what, when, from where.

#### Audit log table

```sql
CREATE TABLE audit_logs (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id       TEXT NOT NULL REFERENCES users(id),
  user_email    TEXT NOT NULL,
  action        TEXT NOT NULL,       -- e.g., "user.created", "channel.started", "settings.updated"
  resource_type TEXT,                -- e.g., "user", "channel", "session"
  resource_id   TEXT,
  details       JSONB,              -- Arbitrary metadata (old value, new value, etc.)
  ip_address    TEXT,
  user_agent    TEXT,
  org_id        TEXT REFERENCES organizations(id)
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_org_id ON audit_logs (org_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
```

#### Audit helper

```typescript
// dashboard/src/lib/audit.ts
import { prisma } from "./db";

export async function logAudit(params: {
  userId: string;
  userEmail: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  orgId?: string;
}) {
  await prisma.auditLog.create({ data: params });
}
```

Every mutation in the tRPC layer calls `logAudit()` after a successful operation. This is non-negotiable for enterprise.

### 3d. Secrets Management

| Secret | Storage |
|---|---|
| Database URL | Environment variable (`DATABASE_URL`) |
| NextAuth secret | Environment variable (`NEXTAUTH_SECRET`) |
| Gateway token | Environment variable (`OPENCLAW_GATEWAY_TOKEN`) |
| OAuth client secrets | Environment variables |
| API keys (OpenAI, etc.) | Existing OpenClaw config (`~/.openclaw/`) |

For production: use Docker secrets or a vault (HashiCorp Vault, AWS Secrets Manager, Doppler). For a beginner getting started, `.env.local` files (gitignored) are acceptable.

**Critical rule**: The `.gitignore` must include:
```
.env
.env.local
.env.production
dashboard/.env*
!.env.example
!.env.local.example
```

---

## 4. Frontend Architecture

### 4a. Technology Stack

| Layer | Choice | Justification |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Server components, built-in API routes, middleware, excellent DX |
| Component library | **shadcn/ui** | Not a npm package -- generates source code into your project. Full control, beautiful defaults, built on Radix UI primitives. Beginner-friendly because you can read and modify every component. |
| Styling | **Tailwind CSS v4** | Comes with shadcn/ui. Utility-first, no CSS files to manage. |
| State management | **Zustand** (client) + **React Server Components** (server) | Zustand is the simplest state library (< 1KB, no boilerplate). Most state lives on the server via RSC; Zustand handles only ephemeral client state (modals, filters, sidebar toggle). |
| Data fetching | **tRPC v11** | End-to-end type safety between Next.js frontend and Next.js API routes. No code generation. Autocomplete for every API call. Ideal for a TypeScript monorepo. |
| Charts | **Recharts** | Most popular React charting library, good docs, works well with shadcn/ui aesthetics. |
| Forms | **React Hook Form** + **Zod** | RHF is the standard. Zod resolvers give you type-safe form validation that matches your API schemas. |
| Tables | **TanStack Table** | shadcn/ui includes a TanStack Table integration. Sorting, filtering, pagination out of the box. |
| Icons | **Lucide React** | Comes with shadcn/ui. Consistent, clean icon set. |

### 4b. Dashboard Layout

```
+-----------------------------------------------+
| Top Bar: Logo | Search | Notifications | User  |
+--------+--------------------------------------+
| Sidebar|  Main Content Area                    |
|        |                                       |
| [Dash] |  +----------------------------------+ |
| [Users]|  | Page Header + Breadcrumbs         | |
| [Chan] |  +----------------------------------+ |
| [Sess] |  |                                  | |
| [Analy]|  |  Page Content                    | |
| [Audit]|  |  (tables, cards, charts, forms)  | |
| [Sett] |  |                                  | |
|        |  +----------------------------------+ |
+--------+--------------------------------------+
```

#### Pages

1. **Dashboard** (`/dashboard`): Overview cards (active channels, total users, messages today, system health), recent activity feed, quick actions.
2. **Users** (`/users`): User table with search/filter, invite user dialog, role assignment, disable/enable.
3. **Channels** (`/channels`): Status of all connected messaging channels (WhatsApp, Telegram, etc.), start/stop controls, configuration forms.
4. **Sessions** (`/sessions`): Active AI sessions, conversation history viewer, session management.
5. **Analytics** (`/analytics`): Message volume over time, channel breakdown, response times, model usage.
6. **Audit Log** (`/audit-log`): Searchable, filterable log of all administrative actions.
7. **Settings** (`/settings`): General settings, security settings, model configuration, notification preferences.

### 4c. Component Organization

```
dashboard/src/components/
  ui/                      -- shadcn/ui primitives (Button, Card, Dialog, Table, etc.)
  dashboard/
    sidebar.tsx            -- Navigation sidebar
    top-bar.tsx            -- Top navigation bar
    page-header.tsx        -- Reusable page header with breadcrumbs
    stat-card.tsx          -- Metric card (number + label + trend)
    activity-feed.tsx      -- Recent activity list
    channel-status-badge.tsx
    role-badge.tsx
    user-avatar.tsx
  charts/
    message-volume-chart.tsx
    channel-breakdown-chart.tsx
    response-time-chart.tsx
  forms/
    user-invite-form.tsx
    channel-config-form.tsx
    settings-form.tsx
```

---

## 5. Database Recommendation

### Choice: **PostgreSQL** via **Prisma ORM**

| Criterion | PostgreSQL + Prisma | SQLite (existing) | MongoDB |
|---|---|---|---|
| Multi-user concurrency | Excellent | Poor (file locks) | Good |
| JSONB for flexible data | Yes | Limited | Native (but overkill here) |
| Prisma support | First-class | Supported but limited | Supported |
| Enterprise readiness | Industry standard | Not suitable | Less common for auth/audit |
| Beginner friendliness | Good (Prisma Studio GUI) | Simpler | More complex (schema-less) |
| Managed hosting options | Neon, Supabase, RDS, etc. | N/A | Atlas, etc. |

**The existing OpenClaw backend uses SQLite** (via `sqlite-vec`) for its own data (memory, embeddings). **Do not replace this.** The enterprise dashboard gets its own PostgreSQL database for enterprise-specific data: users, roles, organizations, audit logs, dashboard settings.

### Prisma schema (core tables)

```prisma
// dashboard/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  users     User[]
  auditLogs AuditLog[]
}

model User {
  id             String       @id @default(uuid())
  email          String       @unique
  name           String?
  passwordHash   String?      // null for OAuth-only users
  role           Role         @default(VIEWER)
  orgId          String
  organization   Organization @relation(fields: [orgId], references: [id])
  emailVerified  DateTime?
  image          String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  accounts       Account[]    // OAuth accounts (NextAuth)
  sessions       Session[]    // NextAuth sessions
  auditLogs      AuditLog[]
}

enum Role {
  SUPER_ADMIN
  ORG_ADMIN
  OPERATOR
  VIEWER
}

model Account {
  // NextAuth standard fields
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  // NextAuth standard fields
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model AuditLog {
  id           String       @id @default(uuid())
  timestamp    DateTime     @default(now())
  userId       String
  user         User         @relation(fields: [userId], references: [id])
  userEmail    String
  action       String
  resourceType String?
  resourceId   String?
  details      Json?
  ipAddress    String?
  userAgent    String?
  orgId        String?
  organization Organization? @relation(fields: [orgId], references: [id])

  @@index([timestamp(sort: Desc)])
  @@index([userId])
  @@index([orgId])
  @@index([action])
}
```

---

## 6. Deployment Architecture

### Development (local)

```
Docker Compose:
  1. clawd-gateway     -- Existing OpenClaw gateway (port 18789)
  2. clawd-dashboard   -- Next.js dashboard (port 3000)
  3. postgres           -- PostgreSQL 16 (port 5432)
```

### Updated docker-compose.yml additions

```yaml
services:
  # ... existing openclaw-gateway service ...

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: clawd_enterprise
      POSTGRES_USER: clawd
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U clawd"]
      interval: 5s
      timeout: 3s
      retries: 5

  clawd-dashboard:
    build:
      context: .
      dockerfile: dashboard/Dockerfile
    environment:
      DATABASE_URL: postgresql://clawd:${POSTGRES_PASSWORD:-changeme}@postgres:5432/clawd_enterprise
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      OPENCLAW_GATEWAY_URL: http://openclaw-gateway:18789
      OPENCLAW_GATEWAY_TOKEN: ${OPENCLAW_GATEWAY_TOKEN}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      openclaw-gateway:
        condition: service_started

volumes:
  pgdata:
```

### Production deployment options

#### Option A: Docker Compose on a single VPS (simplest, good for small teams)
- All three containers on one machine
- Reverse proxy (Caddy or Traefik) for TLS termination
- Suitable for up to ~50 concurrent users
- Cost: ~$20/month (Hetzner, DigitalOcean, etc.)

#### Option B: Managed services (recommended for most enterprises)
- **Gateway**: Fly.io (already supported) or Railway
- **Dashboard**: Vercel (zero-config Next.js deployment) or Fly.io
- **Database**: Neon (serverless Postgres) or Supabase
- Cost: Free tier viable for small deployments; ~$25-50/month for production

#### Option C: Kubernetes (large enterprise)
- Helm chart with three deployments (gateway, dashboard, postgres)
- Horizontal pod autoscaling for the dashboard
- Use a managed Kubernetes service (EKS, GKE, AKS)
- Only recommended if the organization already runs Kubernetes

**Recommendation for a beginner**: Start with **Option A** (Docker Compose on a VPS) or **Option B** (Vercel + Neon + Fly.io). These are the lowest operational burden. Kubernetes is overkill until you have 500+ users or hard compliance requirements.

---

## 7. Phased Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)
**Goal**: A working Next.js dashboard with authentication and a basic landing page.

Tasks:
1. Create `dashboard/` workspace with Next.js 15, TypeScript, Tailwind CSS v4
2. Install and configure shadcn/ui (run `npx shadcn@latest init`)
3. Set up Prisma with PostgreSQL schema (User, Organization, Account, Session, AuditLog)
4. Configure NextAuth.js v5 with credentials provider (email/password)
5. Build the login page and first-time setup page (create initial admin user)
6. Build the dashboard shell: sidebar navigation, top bar, responsive layout
7. Add Next.js middleware for auth-gated routes
8. Add Docker Compose entries for Postgres and the dashboard
9. Write the `dashboard/Dockerfile`
10. Update `pnpm-workspace.yaml`

**Deliverable**: You can log in and see an empty dashboard with navigation.

### Phase 2: Core Features (Weeks 4-7)
**Goal**: The dashboard is functional and connects to the OpenClaw gateway.

Tasks:
1. Set up tRPC with Next.js App Router
2. Build the Gateway API client (`dashboard/src/lib/api-client.ts`) that talks to the OpenClaw gateway over HTTP/WS using the existing protocol
3. Implement the **Dashboard** page: system health, active channels, message counts (pulled from gateway)
4. Implement the **Channels** page: list channels, show status, start/stop controls
5. Implement the **Users** page: list users, invite new users, assign roles, disable accounts
6. Implement RBAC enforcement in tRPC middleware
7. Add audit logging to all mutation operations
8. Implement the **Audit Log** page: searchable, filterable table of actions
9. Begin the rebrand: update package names, UI copy, logos, colors from OpenClaw to Clawd Enterprise

**Deliverable**: Fully functional admin dashboard managing the gateway.

### Phase 3: Analytics and Polish (Weeks 8-10)
**Goal**: The product feels polished and provides value beyond the base OpenClaw.

Tasks:
1. Implement the **Analytics** page: message volume charts, channel breakdown, model usage, response times
2. Implement the **Sessions** page: view active AI sessions, conversation history
3. Implement the **Settings** page: general config, security settings, model preferences
4. Add OAuth providers (Google, Microsoft) to NextAuth
5. Add email notification system (user invite emails, security alerts)
6. Add dark mode toggle (shadcn/ui supports this natively)
7. Security hardening: rate limiting, security headers, input sanitization audit
8. Complete the rebrand (all references to OpenClaw updated)

**Deliverable**: Production-ready enterprise dashboard.

### Phase 4: Enterprise Extras (Weeks 11-14)
**Goal**: Features that differentiate Clawd Enterprise from OpenClaw.

Tasks:
1. SAML SSO integration (for Okta, Azure AD federation)
2. Multi-organization (tenant isolation)
3. Webhook/event system (notify external systems of events)
4. API key management (allow external tools to call the gateway via the dashboard)
5. Backup and restore functionality
6. Kubernetes Helm chart
7. Comprehensive automated test suite (Playwright for E2E, Vitest for unit)

**Deliverable**: Enterprise-differentiated product ready for paying customers.

---

## 8. Key Technology Decisions Summary

| Concern | Technology | Package/Version |
|---|---|---|
| Frontend framework | Next.js (App Router) | `next@15` |
| React | React 19 | `react@19`, `react-dom@19` |
| Component library | shadcn/ui + Radix UI | `@radix-ui/*`, generated components |
| Styling | Tailwind CSS | `tailwindcss@4` |
| Auth | NextAuth.js v5 (Auth.js) | `next-auth@5` |
| ORM | Prisma | `prisma@6`, `@prisma/client@6` |
| Database | PostgreSQL 16 | (external service) |
| API layer | tRPC | `@trpc/server@11`, `@trpc/client@11`, `@trpc/next@11` |
| Validation | Zod | `zod@4` (already in repo) |
| State management | Zustand | `zustand@5` |
| Charts | Recharts | `recharts@2` |
| Forms | React Hook Form | `react-hook-form@7`, `@hookform/resolvers` |
| Tables | TanStack Table | `@tanstack/react-table@8` |
| Icons | Lucide React | `lucide-react` |
| Password hashing | bcrypt | `bcryptjs` (pure JS, no native deps) |
| Rate limiting | Upstash Rate Limit or in-memory | `@upstash/ratelimit` (optional) |
| E2E testing | Playwright | `@playwright/test` |
| Unit testing | Vitest | `vitest` (already in repo) |

---

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Next.js build conflicts with existing tsdown/vite builds | Medium | Separate workspace with its own tsconfig.json; isolated build scripts |
| Database migration management complexity | Medium | Prisma handles migrations declaratively; run `prisma migrate deploy` in CI |
| Gateway API may not expose all needed data | High | Phase 2 includes building `src/enterprise/` API extensions on the backend to expose data the dashboard needs |
| Rebranding breaks upstream merge path | Medium | Keep rebrand as a separate, final step; maintain a clean diff from upstream |
| Beginner overwhelmed by too many technologies | High | Each phase builds incrementally; shadcn/ui and tRPC both have excellent tutorials; Prisma Studio provides a GUI for the database |
| NextAuth v5 is still relatively new | Low | Auth.js is production-stable; large community; well-documented escape hatches |

---

## 10. File and Script References

Key existing files that will be interfaced with or extended:

- **Gateway auth**: `src/gateway/auth.ts` -- Current token/password auth system. The dashboard will use these same tokens server-side.
- **Security audit**: `src/security/audit.ts` -- Existing security scanner. The dashboard can surface these findings in the UI.
- **Gateway server**: `src/gateway/server.ts` -- Main gateway entry point. Enterprise API extensions will be mounted here.
- **Existing UI**: `ui/` -- Lit web components control panel. Not replaced; kept as a lightweight alternative.
- **Docker setup**: `docker-compose.yml` -- Will be extended with postgres and dashboard services.
- **Workspace config**: `pnpm-workspace.yaml` -- Must add `dashboard` entry.
- **Root package.json**: `package.json` -- Will add convenience scripts like `dashboard:dev`, `dashboard:build`.
