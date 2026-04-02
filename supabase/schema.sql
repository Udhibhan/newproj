create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tradebase_id text not null unique,
  stall_name text not null,
  hawker_centre text not null,
  cuisine text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  contact_name text,
  whatsapp text,
  service_areas text[] not null default '{}',
  min_order numeric(12,2),
  typical_delivery_days integer,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.supply_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit text not null,
  preferred_supplier text,
  target_price numeric(12,2),
  needed_by date,
  hawker_centre text,
  notes text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.group_orders (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  unit text not null,
  target_quantity numeric(12,2),
  target_date date,
  hawker_centre text,
  supplier_hint text,
  notes text,
  status text not null default 'collecting',
  created_at timestamptz not null default now()
);

create table if not exists public.group_order_members (
  id uuid primary key default gen_random_uuid(),
  group_order_id uuid not null references public.group_orders(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  quantity numeric(12,2) not null check (quantity > 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (group_order_id, member_id)
);

alter table public.profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.supply_requests enable row level security;
alter table public.group_orders enable row level security;
alter table public.group_order_members enable row level security;

create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated
  using (true);

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "suppliers_select_authenticated" on public.suppliers
  for select to authenticated
  using (true);

create policy "requests_select_authenticated" on public.supply_requests
  for select to authenticated
  using (true);

create policy "requests_insert_own" on public.supply_requests
  for insert to authenticated
  with check (auth.uid() = owner_id);

create policy "requests_update_own" on public.supply_requests
  for update to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "requests_delete_own" on public.supply_requests
  for delete to authenticated
  using (auth.uid() = owner_id);

create policy "group_orders_select_authenticated" on public.group_orders
  for select to authenticated
  using (true);

create policy "group_orders_insert_own" on public.group_orders
  for insert to authenticated
  with check (auth.uid() = created_by);

create policy "group_orders_update_own" on public.group_orders
  for update to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "group_orders_delete_own" on public.group_orders
  for delete to authenticated
  using (auth.uid() = created_by);

create policy "group_members_select_authenticated" on public.group_order_members
  for select to authenticated
  using (true);

create policy "group_members_insert_own" on public.group_order_members
  for insert to authenticated
  with check (auth.uid() = member_id);

create policy "group_members_update_own" on public.group_order_members
  for update to authenticated
  using (auth.uid() = member_id)
  with check (auth.uid() = member_id);

create policy "group_members_delete_own" on public.group_order_members
  for delete to authenticated
  using (auth.uid() = member_id);
