create extension if not exists pgcrypto;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending',
  source text not null default 'homepage',
  confirmation_token_hash text,
  confirmation_expires_at timestamptz,
  subscribed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsletter_subscribers
  add column if not exists confirmation_token_hash text,
  add column if not exists confirmation_expires_at timestamptz,
  add column if not exists confirmed_at timestamptz;

alter table public.newsletter_subscribers
  alter column status set default 'pending';

create index if not exists newsletter_confirmation_token_idx
  on public.newsletter_subscribers (confirmation_token_hash)
  where status = 'pending';

create index if not exists newsletter_subscribers_email_idx
  on public.newsletter_subscribers (email);

create or replace function public.set_newsletter_subscribers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_newsletter_subscribers_updated_at on public.newsletter_subscribers;

create trigger set_newsletter_subscribers_updated_at
before update on public.newsletter_subscribers
for each row
execute function public.set_newsletter_subscribers_updated_at();

alter table public.newsletter_subscribers enable row level security;

revoke all on public.newsletter_subscribers from anon, authenticated;

create or replace function public.request_newsletter_subscription(
  p_email text,
  p_source text,
  p_token_hash text,
  p_expires_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  requested_id uuid;
begin
  insert into public.newsletter_subscribers as subscriber
    (email, source, status, confirmation_token_hash, confirmation_expires_at)
  values (p_email, p_source, 'pending', p_token_hash, p_expires_at)
  on conflict (email) do update set
    source = excluded.source,
    status = 'pending',
    confirmation_token_hash = excluded.confirmation_token_hash,
    confirmation_expires_at = excluded.confirmation_expires_at
  where (subscriber.status <> 'active' or subscriber.confirmed_at is null)
    and subscriber.updated_at < now() - interval '5 minutes'
  returning id into requested_id;

  return requested_id is not null;
end;
$$;

revoke all on function public.request_newsletter_subscription(text, text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.request_newsletter_subscription(text, text, text, timestamptz)
  to service_role;

comment on table public.newsletter_subscribers is
  'Korede James newsletter subscribers. Access through server API only.';
