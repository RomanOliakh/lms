-- Employee invitations: per-member invite token + server-side seat-limit enforcement.
-- Applied to project jokaufikrghrkxcdtpbl via Supabase MCP (recorded version 20260612194631).
--
-- Notes:
-- * `invite_token` gives every membership row a stable opaque id (kept for parity).
--   The accept-link flow uses `invitation_token` + `token_expires_at` (next migration),
--   which can be rotated and expire; `invite_token` stays as a non-rotating identifier.
-- * Seat limit is enforced here via a BEFORE INSERT trigger so it cannot be bypassed
--   from the app layer. seat_limit = 0 means unlimited.

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
