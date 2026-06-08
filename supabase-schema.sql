-- =============================================
-- DECIPHER - Complete Database Schema
-- Run this entire file in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- USERS PROFILE TABLE
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  theme_equipped text default 'dark-cinematic',
  gems integer default 0 not null,
  total_gems_earned integer default 0 not null,
  streak integer default 0 not null,
  longest_streak integer default 0 not null,
  shields integer default 0 not null,
  last_active_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- GOALS TABLE
-- =============================================
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  date date not null,
  completed boolean default false not null,
  completed_at timestamp with time zone,
  category text default 'personal' not null,
  -- categories: work, personal, health, learning, other
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- POMODORO SESSIONS TABLE
-- =============================================
create table public.pomodoro_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  duration_minutes integer default 25 not null,
  completed boolean default false not null,
  completed_at timestamp with time zone,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- GEM TRANSACTIONS TABLE
-- =============================================
create table public.gem_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null, -- positive = earned, negative = spent
  reason text not null,
  -- reasons: goal_complete, pomodoro_complete, streak_repair, theme_purchase, shield_purchase
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- THEME PURCHASES TABLE
-- =============================================
create table public.theme_purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  theme_id text not null,
  purchased_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, theme_id)
);

-- =============================================
-- DAILY REFLECTIONS TABLE (AI)
-- =============================================
create table public.daily_reflections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  goals_completed integer default 0,
  goals_total integer default 0,
  pomodoros_completed integer default 0,
  gems_earned integer default 0,
  reflection_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- =============================================
-- WEEKLY INSIGHTS TABLE (AI)
-- =============================================
create table public.weekly_insights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_start date not null,
  week_end date not null,
  insights_text text,
  pattern_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, week_start)
);

-- =============================================
-- DAILY ACTIVITY TABLE (for consistency grid)
-- =============================================
create table public.daily_activity (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  goals_completed integer default 0,
  goals_total integer default 0,
  pomodoros_completed integer default 0,
  gems_earned integer default 0,
  unique(user_id, date)
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.pomodoro_sessions enable row level security;
alter table public.gem_transactions enable row level security;
alter table public.theme_purchases enable row level security;
alter table public.daily_reflections enable row level security;
alter table public.weekly_insights enable row level security;
alter table public.daily_activity enable row level security;

-- Profiles: users can only see/edit their own
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Goals: users can only CRUD their own goals
create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id);

-- Pomodoros: users can only CRUD their own sessions
create policy "Users can manage own pomodoros"
  on public.pomodoro_sessions for all
  using (auth.uid() = user_id);

-- Gem transactions: users can view their own
create policy "Users can manage own gem transactions"
  on public.gem_transactions for all
  using (auth.uid() = user_id);

-- Theme purchases: users can manage their own
create policy "Users can manage own theme purchases"
  on public.theme_purchases for all
  using (auth.uid() = user_id);

-- Daily reflections: users can manage their own
create policy "Users can manage own reflections"
  on public.daily_reflections for all
  using (auth.uid() = user_id);

-- Weekly insights: users can manage their own
create policy "Users can manage own insights"
  on public.weekly_insights for all
  using (auth.uid() = user_id);

-- Daily activity: users can manage their own
create policy "Users can manage own activity"
  on public.daily_activity for all
  using (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on profiles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- =============================================
-- INDEXES for performance
-- =============================================
create index goals_user_date_idx on public.goals(user_id, date);
create index pomodoros_user_date_idx on public.pomodoro_sessions(user_id, date);
create index gem_transactions_user_idx on public.gem_transactions(user_id, created_at desc);
create index daily_activity_user_date_idx on public.daily_activity(user_id, date);
