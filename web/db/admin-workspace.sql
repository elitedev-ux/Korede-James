create table if not exists public.admin_workspaces (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
    "settings": [],
    "audit": []
  }'::jsonb
)
on conflict (id) do nothing;

comment on table public.admin_workspaces is
  'Private Korede James admin workspace JSON. Access through server API only.';
