-- Serialize seat-limit enforcement to prevent concurrent over-allocation.
--
-- The original enforce_seat_limit() (migration 20260612200000) read the limit and
-- counted members without locking, so two concurrent inserts into the same org could
-- both pass the check and exceed seat_limit. Lock the organization row FOR UPDATE so
-- the limit read and the member count run as a serialized critical section.
-- seat_limit = 0 (or null) still means unlimited.

create or replace function private.enforce_seat_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_limit integer;
  v_count integer;
begin
  select seat_limit into v_limit from public.organizations where id = new.org_id for update;
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
