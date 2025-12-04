<!-- Copilot / AI agent instructions for the ZawajConnect repo -->
# ZawajConnect — AI Coding Agent Guide

Purpose: make an AI coding agent productive quickly by documenting project architecture, conventions, workflows, and examples specific to this repository.

- Project type: Vite + React + TypeScript frontend (see `package.json` scripts).
- Main backend/integration: Supabase (see `supabase/` folder and `src/integrations/`).
- Styling: Tailwind CSS + custom tokens in `tailwind.config.ts`.
- State: React Query for server state, React Context for global state (Auth/User).

Quick commands
- Dev server: `npm run dev` (Vite)
- Build: `npm run build` or `npm run build:dev`
- Tests (watch): `npm run test`; CI/one-shot: `npm run test:run` or `npm run test:coverage`
- Lint: `npm run lint`; auto-fix: `npm run lint:fix`; format: `npm run format`

Key conventions to follow
- Path alias: `@/*` -> `./src/*` (see `tsconfig.json`). Use `@/` in imports: `import { logger } from '@/utils/logger'`.
- Component layout: `src/components/` contains UI + feature components. Base primitives live in `src/components/ui/`.
- Features grouped: `src/hooks/` (custom hooks), `src/contexts/` (providers), `src/pages/` (page-level components), `src/integrations/` (Supabase, payment), `src/lib/` (validation/helpers).
- Testing utilities: import from `@/test/utils` where helpers and custom renderers live.
- TypeScript: progressive strict mode. `noImplicitAny` and `strictNullChecks` enabled; prefer explicit types.

Patterns & examples (copyable)
- Supabase realtime subscription (README example):
```ts
const channel = supabase
  .channel('my-channel')
  .on('postgres_changes', { table: 'subscriptions' }, handleChange)
  .subscribe();
```
- Logger usage: `import { logger } from '@/utils/logger'; logger.api.log('...', data)`.
- Lazy pages: use dynamic imports for route-based code splitting: `const Page = lazy(() => import('@/pages/MyPage'))`.

Project-specific notes
- Env vars: Vite expects `VITE_` prefixed env vars (see README). Never commit `.env`.
- UI: project uses Radix/shadcn primitives — match existing component wrappers in `src/components/ui`.
- Tailwind tokens: many CSS variables used (`--primary`, `--emerald`, etc.) — prefer these tokens instead of fixed hex values; see `tailwind.config.ts` for palette and custom utilities like `.story-link` and `.card-hover`.
- Payments: Braintree is used (`braintree` package) — look at server-integration docs and `supabase/` code before editing payment flows.

Where to look first when changing something
- Authentication & session: `src/contexts/AuthProvider` (or similarly named file) + `useAuth` hook in `src/hooks/`.
- Profiles: `src/components/profile/*` (multiple READMEs exist — use them as source of truth).
- Tests: `src/test/` and `vitest.config.ts`. For UI tests use `@testing-library/react` helpers from `@/test/utils`.
- Supabase SQL & functions: `supabase/migrations/` and `supabase/functions/` — update schema or functions here and coordinate with Supabase project.

Best practices specific to this repo
- Keep changes small and isolated: many components exist; prefer making small focused PRs.
- Follow existing hook/context patterns: new features should expose hooks and context providers the same way (e.g., `useXxx`, `XxxProvider`).
- Tests: add unit tests in `__tests__` next to implementation or in `src/**/__tests__` following existing structure.
- Use `npm run lint` and `npm run format` before PRs.

Common pitfalls
- Do not change global CSS tokens without checking `tailwind.config.ts` and existing components — it can break many views.
- When editing real-time code, ensure channels/unsubscribe logic is correct to avoid memory leaks.
- Because `allowJs` is enabled and migration is ongoing, watch for mixed JS/TS files and preserve import/export style.

If you need more context
- Open `README.md` for full project overview and feature list.
- Look into `package.json` for scripts and dependencies.
- Inspect `src/components/profile/*/README.md` for profile-related design notes.

Questions for maintainers
- Preferred port for dev (README lists `http://localhost:8080` but Vite default may differ) — confirm if we must set `VITE_PORT`.
- Any critical APIs or Supabase policies that require special treatment during local dev (RLS, service roles).

If something is unclear, ask a human reviewer and link the specific file/PR. Keep PR descriptions focused: summary, files changed, dev steps to test.
