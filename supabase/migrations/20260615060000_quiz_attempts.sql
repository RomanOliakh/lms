-- Quiz attempts: persist per-lesson quiz results so the company report can show scores.
--
-- Until now /api/quiz/submit computed the score on the fly and returned it without
-- storing anything. The B2B company report needs per-employee quiz scores, so each
-- submission is now recorded here (latest attempt per user+lesson via upsert).
--
-- RLS mirrors the rest of the B2B model: learners manage their own attempts,
-- platform admins see everything, company admins read attempts of members in the
-- orgs they administer (via a private-schema helper, not exposed as PostgREST RPC).

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  score integer not null,
  total integer not null,
  submitted_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index if not exists idx_quiz_attempts_user on public.quiz_attempts(user_id);
create index if not exists idx_quiz_attempts_lesson on public.quiz_attempts(lesson_id);

-- helper: user_ids of members in orgs the caller administers (private schema)
create or replace function private.org_admin_member_user_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select user_id from public.organization_members
  where user_id is not null
    and org_id in (select private.current_user_admin_org_ids());
$$;
grant execute on function private.org_admin_member_user_ids() to authenticated, anon;

alter table public.quiz_attempts enable row level security;

-- platform admin: full access
create policy qa_platform_all on public.quiz_attempts
  for all using (private.is_platform_admin()) with check (private.is_platform_admin());

-- learner: manage own attempts
create policy qa_self_all on public.quiz_attempts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- company admin: read attempts of members in their orgs
create policy qa_company_admin_select on public.quiz_attempts
  for select using (user_id in (select private.org_admin_member_user_ids()));
