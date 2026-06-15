-- Invitation accept-link: rotatable token + expiry for the /invite/[token] flow.
-- Applied to project jokaufikrghrkxcdtpbl via Supabase MCP (recorded version 20260614203658).
--
-- `invitation_token` is set when an invite is created/resent and cleared on accept,
-- so a consumed or revoked link stops working. `token_expires_at` bounds its lifetime
-- (the app uses 72h). Partial index keeps lookups fast while only indexing live invites.

alter table public.organization_members
  add column if not exists invitation_token uuid unique default null,
  add column if not exists token_expires_at timestamptz default null;

create index if not exists idx_org_members_token
  on public.organization_members (invitation_token)
  where invitation_token is not null;
