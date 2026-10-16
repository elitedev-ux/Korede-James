create table if not exists public.rate_limit_buckets (
  key_hash text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  expires_at timestamptz not null
);

alter table public.rate_limit_buckets enable row level security;

create or replace function public.consume_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_current_time timestamptz := clock_timestamp();
  current_count integer;
begin
  insert into public.rate_limit_buckets as bucket (
    key_hash,
    window_started_at,
    request_count,
    expires_at
  )
  values (
    p_key_hash,
    v_current_time,
    1,
    v_current_time + make_interval(secs => p_window_seconds)
  )
  on conflict (key_hash) do update
  set request_count = case
        when bucket.expires_at <= v_current_time then 1
        else bucket.request_count + 1
      end,
      window_started_at = case
        when bucket.expires_at <= v_current_time then v_current_time
        else bucket.window_started_at
      end,
      expires_at = case
        when bucket.expires_at <= v_current_time
          then v_current_time + make_interval(secs => p_window_seconds)
        else bucket.expires_at
      end
  returning request_count into current_count;

  return current_count <= greatest(1, least(p_limit, 10000));
end;
$$;

revoke all on table public.rate_limit_buckets from public, anon, authenticated;
revoke all on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;
