set lock_timeout = '10s';
set statement_timeout = '60s';

create extension if not exists pgcrypto with schema extensions;

create table public.job_sources (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  api_name text,
  base_url text,
  attribution_text text,
  active boolean not null default true,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_sources_key_format check (key ~ '^[a-z0-9][a-z0-9._-]*$'),
  constraint job_sources_name_not_blank check (btrim(name) <> ''),
  constraint job_sources_base_url_valid check (
    base_url is null or base_url ~* '^https?://[^[:space:]]+$'
  )
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  source text not null references public.job_sources(key) on update cascade on delete restrict,
  external_job_id text not null,
  title text not null,
  slug text,
  company text,
  company_logo_url text,
  location text,
  city text,
  country text,
  remote_type text,
  job_type text,
  category text,
  salary_min numeric,
  salary_max numeric,
  salary_currency text,
  salary_period text,
  description text,
  description_html text,
  apply_url text not null,
  source_url text,
  published_at timestamptz,
  expires_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_source_external_unique unique (source, external_job_id),
  constraint jobs_external_id_not_blank check (btrim(external_job_id) <> ''),
  constraint jobs_title_not_blank check (btrim(title) <> ''),
  constraint jobs_slug_format check (
    slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint jobs_company_logo_url_valid check (
    company_logo_url is null or company_logo_url ~* '^https?://[^[:space:]]+$'
  ),
  constraint jobs_apply_url_valid check (apply_url ~* '^https?://[^[:space:]]+$'),
  constraint jobs_source_url_valid check (
    source_url is null or source_url ~* '^https?://[^[:space:]]+$'
  ),
  constraint jobs_salary_min_nonnegative check (salary_min is null or salary_min >= 0),
  constraint jobs_salary_max_nonnegative check (salary_max is null or salary_max >= 0),
  constraint jobs_salary_range_valid check (
    salary_min is null or salary_max is null or salary_max >= salary_min
  ),
  constraint jobs_salary_currency_format check (
    salary_currency is null or salary_currency ~ '^[A-Z]{3}$'
  ),
  constraint jobs_salary_period_valid check (
    salary_period is null or salary_period in ('hour', 'day', 'week', 'month', 'year')
  ),
  constraint jobs_seen_range_valid check (last_seen_at >= first_seen_at),
  constraint jobs_expiry_range_valid check (
    expires_at is null or published_at is null or expires_at > published_at
  )
);

create unique index jobs_slug_unique_idx
  on public.jobs (slug)
  where slug is not null;

create index jobs_active_published_idx
  on public.jobs (published_at desc nulls last)
  where is_active;

create index jobs_active_city_idx
  on public.jobs (city)
  where is_active and city is not null;

create index jobs_active_country_idx
  on public.jobs (country)
  where is_active and country is not null;

create index jobs_active_category_idx
  on public.jobs (category)
  where is_active and category is not null;

create index jobs_active_type_idx
  on public.jobs (job_type)
  where is_active and job_type is not null;

create index jobs_active_company_idx
  on public.jobs (company)
  where is_active and company is not null;

create index jobs_active_expiry_idx
  on public.jobs (expires_at)
  where is_active and expires_at is not null;

create table public.job_import_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null references public.job_sources(key) on update cascade on delete restrict,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  jobs_received integer not null default 0,
  jobs_inserted integer not null default 0,
  jobs_updated integer not null default 0,
  jobs_deactivated integer not null default 0,
  status text not null default 'running',
  error_message text,
  created_at timestamptz not null default now(),
  constraint job_import_runs_counts_nonnegative check (
    jobs_received >= 0
    and jobs_inserted >= 0
    and jobs_updated >= 0
    and jobs_deactivated >= 0
  ),
  constraint job_import_runs_status_valid check (
    status in ('running', 'succeeded', 'partial', 'failed')
  ),
  constraint job_import_runs_finished_range_valid check (
    finished_at is null or finished_at >= started_at
  ),
  constraint job_import_runs_completion_valid check (
    (status = 'running' and finished_at is null)
    or (status <> 'running' and finished_at is not null)
  )
);

create index job_import_runs_source_started_idx
  on public.job_import_runs (source, started_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_job_sources_updated_at
before update on public.job_sources
for each row execute function public.set_updated_at();

create trigger set_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

alter table public.job_sources enable row level security;
alter table public.job_sources force row level security;
alter table public.jobs enable row level security;
alter table public.jobs force row level security;
alter table public.job_import_runs enable row level security;
alter table public.job_import_runs force row level security;

revoke all on table public.job_sources from anon, authenticated;
revoke all on table public.jobs from anon, authenticated;
revoke all on table public.job_import_runs from anon, authenticated;

grant select on table public.job_sources to anon, authenticated;
grant select on table public.jobs to anon, authenticated;

grant all on table public.job_sources to service_role;
grant all on table public.jobs to service_role;
grant all on table public.job_import_runs to service_role;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
grant execute on function public.set_updated_at() to service_role;

create policy "Public can read active job sources"
on public.job_sources
for select
to anon, authenticated
using (active);

create policy "Public can read current active jobs"
on public.jobs
for select
to anon, authenticated
using (is_active and (expires_at is null or expires_at > now()));

comment on table public.job_sources is
  'Approved external job providers and their attribution requirements.';

comment on table public.jobs is
  'Normalized job listings imported from approved sources.';

comment on table public.job_import_runs is
  'Internal audit log for provider import attempts and outcomes.';

comment on column public.jobs.description_html is
  'Provider HTML; sanitize before rendering and store only when source terms permit.';
