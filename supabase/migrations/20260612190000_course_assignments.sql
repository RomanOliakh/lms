-- Course assignments (B2B v1): company assigns training to employees.
-- Applied to project jokaufikrghrkxcdtpbl on 2026-06-12 via Supabase MCP.
--
-- Design notes:
-- * Assignment targets a membership row (organization_members), not a bare user,
--   so it is removed automatically when the employee leaves the org.
-- * org_id is denormalized for cheap RLS checks; the composite FK
--   (member_id, org_id) -> organization_members(id, org_id) guarantees the
--   member actually belongs to that org.
-- * Learner read access goes through private.current_user_member_ids()
--   (private schema — not callable as PostgREST RPC, same as the Phase 0 helpers).

-- organization_members(id) is already unique; add (id, org_id) target for the composite FK
alter table public.organization_members
  add constraint organization_members_id_org_unique unique (id, org_id);

create table if not exists public.course_assignments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  member_id uuid not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  due_at timestamptz,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (member_id, course_id),
  foreign key (member_id, org_id)
    references public.organization_members(id, org_id) on delete cascade
);
create index if not exists idx_course_assignments_org on public.course_assignments(org_id);
create index if not exists idx_course_assignments_member on public.course_assignments(member_id);

-- ──────────────── RLS helper (private schema) ────────────────

create or replace function private.current_user_member_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select id from public.organization_members
  where user_id = auth.uid() and status = 'active';
$$;

grant execute on function private.current_user_member_ids() to authenticated, anon;

-- ───────────────────────── RLS policies ─────────────────────────

alter table public.course_assignments enable row level security;

-- platform admin: full access
create policy ca_platform_all on public.course_assignments
  for all using (private.is_platform_admin()) with check (private.is_platform_admin());

-- company admins: manage assignments in their own orgs
create policy ca_company_admin_all on public.course_assignments
  for all using (org_id in (select private.current_user_admin_org_ids()))
  with check (org_id in (select private.current_user_admin_org_ids()));

-- learners: read their own assignments
create policy ca_member_select on public.course_assignments
  for select using (member_id in (select private.current_user_member_ids()));
