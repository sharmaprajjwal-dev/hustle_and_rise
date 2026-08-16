set lock_timeout = '10s';
set statement_timeout = '60s';

create table public.email_job_requests (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on update cascade on delete cascade,
  email_hash text not null,
  ip_hash text not null,
  status text not null default 'requested',
  provider_message_id text,
  error_code text,
  requested_at timestamptz not null default now(),
  sent_at timestamptz,
  constraint email_job_requests_email_hash_format check (email_hash ~ '^[a-f0-9]{64}$'),
  constraint email_job_requests_ip_hash_format check (ip_hash ~ '^[a-f0-9]{64}$'),
  constraint email_job_requests_status_valid check (status in ('requested', 'sent', 'failed')),
  constraint email_job_requests_sent_state_valid check (
    (status = 'sent' and sent_at is not null)
    or (status <> 'sent' and sent_at is null)
  )
);

create index email_job_requests_email_requested_idx
  on public.email_job_requests (email_hash, requested_at desc);

create index email_job_requests_ip_requested_idx
  on public.email_job_requests (ip_hash, requested_at desc);

create index email_job_requests_job_requested_idx
  on public.email_job_requests (job_id, requested_at desc);

alter table public.email_job_requests enable row level security;
alter table public.email_job_requests force row level security;

revoke all on table public.email_job_requests from anon, authenticated;
grant all on table public.email_job_requests to service_role;

comment on table public.email_job_requests is
  'Private, short-lived audit records for one-time job emails. Recipient and IP values are stored only as keyed hashes.';
