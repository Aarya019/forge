-- Add activity tracking to challenges (run this if you already ran 002_challenges.sql)

create table public.challenge_activities (
  id            uuid        default gen_random_uuid() primary key,
  challenge_id  uuid        references public.challenges(id) on delete cascade not null,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  name          text        not null,
  order_index   int         not null default 0,
  created_at    timestamptz default now() not null
);

create table public.challenge_activity_logs (
  id            uuid        default gen_random_uuid() primary key,
  activity_id   uuid        references public.challenge_activities(id) on delete cascade not null,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  date          date        not null,
  completed     boolean     default false not null,
  created_at    timestamptz default now() not null,
  unique (activity_id, date)
);

alter table public.challenge_activities    enable row level security;
alter table public.challenge_activity_logs enable row level security;

create policy "own challenge_activities"
  on public.challenge_activities for all
  using  (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own challenge_activity_logs"
  on public.challenge_activity_logs for all
  using  (auth.uid() = user_id) with check (auth.uid() = user_id);
