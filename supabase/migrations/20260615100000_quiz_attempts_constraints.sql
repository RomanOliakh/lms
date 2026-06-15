-- Defense-in-depth CHECK constraints for quiz_attempts (CodeRabbit, PR #11).
-- The app already only writes valid values (total >= 1, 0 <= score <= total), but
-- enforce the invariants at the DB level so no path can corrupt report aggregates.
-- Guarded so it is safe to run after the base migration on a fresh DB too.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_attempts_total_positive') then
    alter table public.quiz_attempts
      add constraint quiz_attempts_total_positive check (total > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'quiz_attempts_score_range') then
    alter table public.quiz_attempts
      add constraint quiz_attempts_score_range check (score >= 0 and score <= total);
  end if;
end $$;
