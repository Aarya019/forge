-- Habits
create table public.habits (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  name        text        not null,
  category    text        not null default 'custom',
  created_at  timestamptz default now() not null
);

-- Habit logs (one row per habit per day)
create table public.habit_logs (
  id          uuid        default gen_random_uuid() primary key,
  habit_id    uuid        references public.habits(id) on delete cascade not null,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  date        date        not null,
  completed   boolean     default false not null,
  created_at  timestamptz default now() not null,
  unique (habit_id, date)
);

-- Row-level security
alter table public.habits    enable row level security;
alter table public.habit_logs enable row level security;

create policy "own habits"
  on public.habits for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own habit_logs"
  on public.habit_logs for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
