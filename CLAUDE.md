# OhMyKick Project Reference (CLAUDE.md)

## Common Commands

### Root Commands
- Install dependencies: `pnpm install`

### Bot Application (`apps/bot`)
- Run in development mode: `pnpm --filter bot dev`
- Build application: `pnpm --filter bot build`
- Start built application: `pnpm --filter bot start`
- Run unit tests: `pnpm --filter bot test`
- Seed match fixtures: `pnpm --filter bot seed-matches`

### Web Application (`apps/web`)
- Run in development mode: `pnpm --filter web dev`
- Build application: `pnpm --filter web build`
- Start built application: `pnpm --filter web start`

---

## Code Guidelines and Standards

### Type Safety & Language
- Use **TypeScript** strictly for all components and logic.
- Avoid using `any`; define explicit interfaces/types for webhooks, payload schemas, and database results.
- Leverage `zod` for parsing and validating run-time configurations, webhooks, and user input structures.

### Directory Structure & Modularization
- Maintain clear boundary separation between database operations, state machine routing, messaging providers (Telegram, WhatsApp), and core flows.
- Database access helper files (`db/*.ts`) must encapsulate all raw query calls. Do not invoke Supabase JS raw queries directly inside flow state handlers.

### Styling & UI
- Use **Vanilla CSS / CSS Modules** in the Next.js web application. Avoid global styling pollution; structure layout using scoped component styles.
- Follow modern layout principles (responsive flexbox, CSS Grid, mobile-first design) for optimized representation on standard device widths.

### Error Handling & Reliability
- Wrap webhook entries and queue processors in `try/catch` and log errors to diagnostic outputs.
- In Fastify request handlers, always return a success code (`200 OK` or `204 No Content`) to webhook providers immediately to prevent repeated triggers; complete execution asynchronously.
