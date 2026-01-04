-- 1. Enable RLS
alter table if exists public.profiles enable row level security;
alter table if exists public.transactions enable row level security;

-- 2. Create Tables (if they don't exist)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    email text,
    role text default 'student' check (role in ('student', 'admin')),
    updated_at timestamptz default now()
);

create table if not exists public.transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null default auth.uid(),
    entity text not null,
    reference text not null,
    amount numeric not null,
    description text,
    status text default 'Pendente' check (status in ('Sucesso', 'Pendente', 'Falhou')),
    created_at timestamptz default now()
);

-- 3. RLS - Profiles
-- Users can see their own profile
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using ( auth.uid() = id );

-- Users can update their own profile
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ( auth.uid() = id );

-- Admins can see all profiles
create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
    )
);

-- 4. RLS - Transactions
-- Users can see their own transactions
create policy "Users can view own transactions"
on public.transactions
for select
to authenticated
using ( auth.uid() = user_id );

-- Users can insert their own transactions
create policy "Users can insert own transactions"
on public.transactions
for insert
to authenticated
with check ( auth.uid() = user_id );

-- Admins can see all transactions
create policy "Admins can view all transactions"
on public.transactions
for select
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
    )
);

-- 5. Handle user creation via Trigger (Auth to Profiles)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
