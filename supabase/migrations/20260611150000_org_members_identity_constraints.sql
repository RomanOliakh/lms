-- Address review finding (PR #6): membership rows must identify a user or an
-- invitee, and pending invitations must be unique per org+email.
-- Applied to project jokaufikrghrkxcdtpbl on 2026-06-11 via Supabase MCP.

alter table public.organization_members
  add constraint org_members_has_identity
  check (user_id is not null or invited_email is not null);

create unique index if not exists idx_org_members_pending_email
  on public.organization_members (org_id, invited_email)
  where user_id is null;
