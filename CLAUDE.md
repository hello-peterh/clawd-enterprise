AGENTS.md

# Clawd Enterprise

## What This Project Is

**Clawd Enterprise** is a fork of [OpenClaw](https://github.com/openclaw/openclaw) (a single-user personal AI assistant with 30+ messaging channel integrations) being transformed into a **multi-user, enterprise-grade product**.

- Fork: `https://github.com/hello-peterh/clawd-enterprise`
- Upstream: `https://github.com/openclaw/openclaw`

## What We're Adding (on top of OpenClaw)

- **Multi-user auth & RBAC** — NextAuth.js v5 with roles: `SUPER_ADMIN`, `ORG_ADMIN`, `OPERATOR`, `VIEWER`
- **React/Next.js dashboard** — separate from the existing Lit UI (`ui/`), lives in `dashboard/`
- **PostgreSQL database** — for enterprise data (users, orgs, audit logs); OpenClaw's SQLite stays untouched
- **Audit logging** — who did what, when, from where
- **Enterprise security** — SSO (OAuth/SAML), rate limiting, security headers
- **Rebrand** — from OpenClaw to Clawd Enterprise

## Architecture (BFF Pattern)

```
Browser --> Next.js Dashboard (port 3000)
               |
               +--> NextAuth (auth + sessions)
               +--> Prisma (PostgreSQL)
               +--> tRPC (type-safe API)
               |
               +--> OpenClaw Gateway (port 18789) [server-side only]
                    (gateway token never reaches the browser)
```

## Tech Stack (Dashboard)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth v5 (Auth.js) + Prisma adapter |
| Database | PostgreSQL 16 via Prisma ORM |
| API layer | tRPC v11 |
| Validation | Zod (already in repo) |
| State | Zustand (client) + RSC (server) |
| Charts | Recharts |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod |

## Key Integration Points

| File | Role |
|------|------|
| `src/gateway/auth.ts` | Token/password auth — dashboard reuses server-side |
| `src/gateway/server-http.ts` | HTTP pipeline — enterprise routes mount here |
| `src/gateway/server-methods-list.ts` | 88+ RPC methods the dashboard calls |
| `src/security/audit.ts` | Existing security scanner — dashboard surfaces findings |
| `ui/` | Existing Lit UI — kept as-is, not replaced |
| `docker-compose.yml` | Extended with postgres + dashboard services |

## Implementation Phases

1. **Phase 1: Foundation** — Next.js scaffold, PostgreSQL + Prisma, NextAuth, dashboard shell layout, Docker Compose *(partially started — `dashboard/` exists)*
2. **Phase 2: Core Features** — Gateway API client, tRPC, RBAC enforcement, dashboard pages (Users, Channels, Audit Log), audit logging
3. **Phase 3: Polish** — Analytics, OAuth providers, dark mode, security hardening, rebrand
4. **Phase 4: Enterprise Extras** — SAML SSO, multi-tenant, webhooks, API keys, Helm chart

## Dashboard Pages

- **Dashboard** — overview cards, system health, activity feed
- **Users** — user table, invite, role assignment, disable/enable
- **Channels** — channel grid, start/stop, configuration
- **Analytics** — message volume, model usage charts
- **Audit Log** — searchable/filterable action log
- **Settings** — general, security, model config

## Full Plans

- Architecture plan: `docs/architecture-plan.md`
- Implementation plan: `docs/implementation-plan.md`

## Development

- Install deps: `pnpm install`
- Run dashboard: `pnpm dashboard:dev`
- Run gateway: `pnpm dev`
- Docker: `docker compose up`
- Database: PostgreSQL (local install or Docker)
