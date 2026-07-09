-- Run this once in Supabase: Project → SQL Editor → New query → paste → Run.

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  date date not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  category text not null,
  person text not null check (person in ('Karthik', 'Likhita')),
  note text
);

create table if not exists holdings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  person text not null check (person in ('Karthik', 'Likhita')),
  invested numeric not null default 0,
  current_value numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  saved_amount numeric not null default 0,
  target_date date,
  person text not null default 'Both' check (person in ('Karthik', 'Likhita', 'Both'))
);

-- Row Level Security: this app has no login screen, so it uses the public
-- anon key for both of you. These policies open read/write to anyone with
-- that key, which is the trade-off for a no-login, two-person shared app.
-- Keep your deployed URL and repo private. See README for adding real auth.
alter table entries enable row level security;
alter table holdings enable row level security;
alter table plans enable row level security;

create policy "anon full access" on entries for all using (true) with check (true);
create policy "anon full access" on holdings for all using (true) with check (true);
create policy "anon full access" on plans for all using (true) with check (true);

-- Enable realtime so both of you see updates live without refreshing.
alter publication supabase_realtime add table entries;
alter publication supabase_realtime add table holdings;
alter publication supabase_realtime add table plans;
