create extension if not exists pgcrypto;

create table if not exists public.customer_accounts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  password_hash text not null,
  password_salt text not null,
  reset_token_hash text,
  reset_requested_at timestamptz,
  reset_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_accounts_email_idx
  on public.customer_accounts (email);

create index if not exists customer_accounts_reset_token_hash_idx
  on public.customer_accounts (reset_token_hash);

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

comment on table public.customer_accounts is
  'Private customer account records for Korede James client portal. Access through server API only.';
