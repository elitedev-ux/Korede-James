create extension if not exists pgcrypto;

create table if not exists public.customer_accounts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  password_hash text not null,
  password_salt text not null,
  email_verified_at timestamptz,
  verification_token_hash text,
  verification_expires_at timestamptz,
  verification_requested_at timestamptz,
  session_version integer not null default 1,
  reset_token_hash text,
  reset_requested_at timestamptz,
  reset_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_accounts
  add column if not exists email_verified_at timestamptz,
  add column if not exists verification_token_hash text,
  add column if not exists verification_expires_at timestamptz,
  add column if not exists verification_requested_at timestamptz,
  add column if not exists session_version integer not null default 1;

create index if not exists customer_accounts_email_idx
  on public.customer_accounts (email);

create index if not exists customer_accounts_reset_token_hash_idx
  on public.customer_accounts (reset_token_hash);

create index if not exists customer_accounts_verification_token_hash_idx
  on public.customer_accounts (verification_token_hash);

create or replace function public.set_customer_accounts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_customer_accounts_updated_at on public.customer_accounts;

create trigger set_customer_accounts_updated_at
before update on public.customer_accounts
for each row
execute function public.set_customer_accounts_updated_at();

alter table public.customer_accounts enable row level security;

revoke all on public.customer_accounts from anon, authenticated;

create or replace function public.request_customer_email_verification(
  p_email text,
  p_token_hash text,
  p_expires_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  updated_id uuid;
begin
  update public.customer_accounts
  set verification_token_hash = p_token_hash,
      verification_expires_at = p_expires_at,
      verification_requested_at = now()
  where email = lower(trim(p_email))
    and email_verified_at is null
    and (
      verification_requested_at is null
      or verification_requested_at < now() - interval '5 minutes'
    )
  returning id into updated_id;

  return updated_id is not null;
end;
$$;

revoke all on function public.request_customer_email_verification(text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.request_customer_email_verification(text, text, timestamptz)
  to service_role;

comment on table public.customer_accounts is
  'Private customer account records for Korede James client portal. Access through server API only.';
