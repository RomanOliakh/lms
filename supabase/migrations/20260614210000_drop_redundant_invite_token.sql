-- Cleanup: drop the redundant `invite_token` column on organization_members.
--
-- Two token columns ended up on the table from parallel work:
--   * invite_token        (NOT NULL, added by 20260612200000_employee_invitations)
--   * invitation_token     + token_expires_at (the accept-link the app actually uses)
-- The accept flow (lib/actions/invitations.ts, app/invite/[token]) keys entirely off
-- invitation_token, and invite_token is referenced nowhere in code, functions,
-- policies, views, or constraints — only its own unique index. Dropping the column
-- removes that index automatically. The seat-limit trigger added in the same earlier
-- migration is unaffected and stays.

drop index if exists public.idx_org_members_invite_token;

alter table public.organization_members
  drop column if exists invite_token;
