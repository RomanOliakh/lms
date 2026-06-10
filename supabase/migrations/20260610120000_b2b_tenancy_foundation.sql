-- B2B multi-tenant foundation (Phase 0 / v1 minimal sellable scope)
-- Tenants (companies) + memberships + org-scoped RLS.
-- Applied to project jokaufikrghrkxcdtpbl on 2026-06-10 via Supabase MCP.
--
-- Design notes:
-- * Content (courses/modules/lessons/quiz) stays platform-owned (not org-scoped).
--   Learner/membership data is org-scoped via RLS below.
-- * RLS helper functions live in a non-API-exposed `private` schema so they are
--   NOT callable as PostgREST RPC, while still usable inside policies.
-- * Platform role = profiles.role = 'admin'. Org roles live on organization_members.

-- ───────────────────────── Tables ─────────────────────────

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  status text not null default 'active' check (status in ('active','suspended')),
  seat_limit integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,  -- null until invite accepted
  org_role text not null default 'learner'
    check (org_role in ('owner','company_admin','manager','instructor','learner')),
  status text not null default 'invited' check (status in ('invited','active')),
  invited_email text,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);
create index if not exists idx_org_members_user on public.organization_members(user_id);
create index if not exists idx_org_members_org on public.organization_members(org_id);

-- ──────────────── RLS helper functions (private schema) ────────────────

create schema if not exists private;
grant usage on schema private to authenticated, anon;

create or replace function private.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function private.current_user_org_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select org_id from public.organization_members
  where user_id = auth.uid() and status = 'active';
$$;

create or replace function private.current_user_admin_org_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select org_id from public.organization_members
  where user_id = auth.uid() and status = 'active' and org_role in ('owner','company_admin');
$$;

grant execute on function private.is_platform_admin(),
  private.current_user_org_ids(), private.current_user_admin_org_ids()
  to authenticated, anon;

-- ───────────────────────── RLS policies ─────────────────────────

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- organizations: platform admin full; members can read their own orgs
create policy org_platform_all on public.organizations
  for all using (private.is_platform_admin()) with check (private.is_platform_admin());
create policy org_member_select on public.organizations
  for select using (id in (select private.current_user_org_ids()));

-- organization_members: platform admin full; user reads own row; company admins manage their org
create policy om_platform_all on public.organization_members
  for all using (private.is_platform_admin()) with check (private.is_platform_admin());
create policy om_self_select on public.organization_members
  for select using (user_id = auth.uid());
create policy om_company_admin_select on public.organization_members
  for select using (org_id in (select private.current_user_admin_org_ids()));
create policy om_company_admin_write on public.organization_members
  for all using (org_id in (select private.current_user_admin_org_ids()))
  with check (org_id in (select private.current_user_admin_org_ids()));
