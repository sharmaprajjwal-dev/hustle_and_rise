set lock_timeout = '10s';
set statement_timeout = '60s';

create unique index job_import_runs_one_running_per_source_idx
  on public.job_import_runs (source)
  where status = 'running';

comment on index public.job_import_runs_one_running_per_source_idx is
  'Prevents overlapping imports from racing for the same provider.';
