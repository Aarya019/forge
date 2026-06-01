-- Challenges (75 Hard style)
create table public.challenges (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  name          text        not null,
  duration_days int         not null default 75,
  start_date    date        not null,
  is_active     boolean     default true not null,
  created_at    timestamptz default now() not null
);

-- Activities defined for a challenge (e.g. "Workout", "Read 10 pages", "No junk food")
create table public.challenge_activities (
  id            uuid        default gen_random_uuid() primary key,
  challenge_id  uuid        references public.challenges(id) on delete cascade not null,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  name          text        not null,
  order_index   int         not null default 0,
  created_at    timestamptz default now() not null
);

-- Daily completion per activity
create table public.challenge_activity_logs (
  id            uuid        default gen_random_uuid() primary key,
  activity_id   uuid        references public.challenge_activities(id) on delete cascade not null,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  date          date        not null,
  completed     boolean     default false not null,
  created_at    timestamptz default now() not null,
  unique (activity_id, date)
);

-- Overall day result (auto-managed: true when ALL activities done)
create table public.challenge_days (
  id            uuid        default gen_random_uuid() primary key,
  challenge_id  uuid        references public.challenges(id) on delete cascade not null,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  day_number    int         not null,
  date          date        not null,
  all_completed boolean     not null,
  created_at    timestamptz default now() not null,
  unique (challenge_id, date)
);

-- RLS
alter table public.challenges              enable row level security;
alter table public.challenge_activities    enable row level security;
alter table public.challenge_activity_logs enable row level security;
alter table public.challenge_days          enable row level security;

create policy "own challenges"
  on public.challenges for all
  using  (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own challenge_activities"
  on public.challenge_activities for all
  using  (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own challenge_activity_logs"
  on public.challenge_activity_logs for all
  using  (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own challenge_days"
  on public.challenge_days for all
  using  (auth.uid() = user_id) with check (auth.uid() = user_id);
