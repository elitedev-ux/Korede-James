create table if not exists public.admin_workspaces (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_workspaces
  add column if not exists version bigint not null default 1;

create or replace function public.set_admin_workspaces_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_admin_workspaces_updated_at on public.admin_workspaces;

create trigger set_admin_workspaces_updated_at
before update on public.admin_workspaces
for each row
execute function public.set_admin_workspaces_updated_at();

alter table public.admin_workspaces enable row level security;

create or replace function public.replace_admin_workspace(
  p_id text,
  p_data jsonb,
  p_expected_version bigint
)
returns table(workspace_data jsonb, workspace_version bigint)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  return query
  update public.admin_workspaces as workspace
  set data = p_data,
      version = workspace.version + 1
  where workspace.id = p_id
    and workspace.version = p_expected_version
  returning workspace.data, workspace.version;

  if not found then
    raise exception 'Workspace changed before it could be saved.'
      using errcode = '40001';
  end if;
end;
$$;

revoke all on function public.replace_admin_workspace(text, jsonb, bigint)
  from public, anon, authenticated;
grant execute on function public.replace_admin_workspace(text, jsonb, bigint)
  to service_role;

insert into public.admin_workspaces (id, data)
values (
  'main',
  '{
    "requests": [],
    "pieces": [],
    "team": [],
    "orders": [],
    "customers": [],
    "contracts": [],
    "measurements": [],
    "materials": [],
    "content": [],
    "promotions": [],
    "newsletter": [],
    "newsletterSegments": [],
    "newsletterUpdates": [],
    "errors": [],
    "settings": [],
    "audit": []
  }'::jsonb
)
on conflict (id) do nothing;

comment on table public.admin_workspaces is
  'Private Korede James admin workspace JSON. Access through server API only.';
