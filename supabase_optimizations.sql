-- 1. Automate User Registration via DB Triggers
-- This automatically inserts a row into public.users whenever a user signs up.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (auth_id, email, role, is_verified)
  values (new.id, new.email, 'student', true);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Add Database Indexing for High Traffic 5k Users
-- Speeds up college searches drastically instead of doing a Sequential Scan.

create index if not exists idx_colleges_city on colleges(city);
create index if not exists idx_colleges_state on colleges(state);
create index if not exists idx_colleges_fee_min on colleges(fee_min);
create index if not exists idx_colleges_college_type on colleges(college_type);
create index if not exists idx_colleges_placement_rate on colleges(placement_rate desc);
