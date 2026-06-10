# LMS — B2B Corporate Learning Platform

Multi-tenant corporate LMS built as a partnership. Companies onboard employees, assign training, and track completion (reports + certificates).

> **Status:** pivoting from a B2C course shop (Sprints 1–3, done) to a B2B multi-tenant platform. Phase 0 (tenancy foundation) complete. See the [roadmap board](https://github.com/users/RomanOliakh/projects/3) and [docs/discovery-questions.md](docs/discovery-questions.md) for open product decisions.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (DB/Auth/Storage) · Stripe · Bunny.net (video) · Resend (email)

## Development

```bash
npm install
npm run dev -- -p 3001   # dev server on :3001
npm run build:safe       # memory-guarded production build
npm run lint
```

Environment variables go in `.env.local` — see the list in [CLAUDE.md](CLAUDE.md). Database schema migrations live in `supabase/migrations/`.

## Key docs

- [CLAUDE.md](CLAUDE.md) — project conventions, current scope (B2B v1), sprint history
- [docs/discovery-questions.md](docs/discovery-questions.md) — open questions for the partner
- [lms-design-system.md](lms-design-system.md) — design system spec
