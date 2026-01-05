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

-- 3. HELPER FUNCTION TO PREVENT RECURSION
-- This function checks if a user is admin without triggering RLS
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 4. RLS - Profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using ( auth.uid() = id or public.is_admin() );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using ( auth.uid() = id );

-- 5. RLS - Transactions
drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view own transactions"
on public.transactions for select
to authenticated
using ( auth.uid() = user_id or public.is_admin() );

drop policy if exists "Users can insert own transactions" on public.transactions;
create policy "Users can insert own transactions"
on public.transactions for insert
to authenticated
with check ( auth.uid() = user_id );

-- 6. Handle user creation via Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', ''), 
    new.email,
    'student' -- Default role
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
