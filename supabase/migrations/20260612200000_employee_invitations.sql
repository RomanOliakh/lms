-- Employee invitations (B2B v1): invite token + server-side seat limit.
-- Applied to project jokaufikrghrkxcdtpbl on 2026-06-12 via Supabase MCP.
--
-- Design notes:
-- * The invite link is /invite/<invite_token>; the token is a capability —
--   anyone with the link can view org name + invited email, so accept flow
--   verifies the email matches before linking a user.
-- * Seat limit is enforced by a BEFORE INSERT trigger (counts both invited
--   and active members; 0 = unlimited), closing the gap left by Phase 0
--   where seat_limit was informational only.

alter table public.organization_members
  add column if not exists invite_token uuid not null default gen_random_uuid();
create unique index if not exists idx_org_members_invite_token
  on public.organization_members(invite_token);

create or replace function private.enforce_seat_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_limit integer;
  v_count integer;
begin
  select seat_limit into v_limit from public.organizations where id = new.org_id;
  if v_limit is not null and v_limit > 0 then
    select count(*) into v_count from public.organization_members where org_id = new.org_id;
    if v_count >= v_limit then
      raise exception 'Seat limit reached for this company (% seats)', v_limit
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_seat_limit on public.organization_members;
create trigger trg_enforce_seat_limit
  before insert on public.organization_members
  for each row execute function private.enforce_seat_limit();
