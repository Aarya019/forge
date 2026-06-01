-- Safe to run even if some tables already exist

create table if not exists public.exercises (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users(id) on delete cascade,
  name       text        not null,
  category   text        not null,
  type       text        not null,
  created_at timestamptz default now()
);

create table if not exists public.workout_sessions (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  name        text,
  started_at  timestamptz default now() not null,
  finished_at timestamptz,
  created_at  timestamptz default now() not null
);

create table if not exists public.workout_sets (
  id               uuid        default gen_random_uuid() primary key,
  session_id       uuid        references public.workout_sessions(id) on delete cascade not null,
  exercise_id      uuid        references public.exercises(id) not null,
  set_number       int         not null,
  reps             int,
  weight_kg        numeric(6,2),
  duration_seconds int,
  distance_km      numeric(7,3),
  completed        boolean     default false not null,
  created_at       timestamptz default now()
);

create table if not exists public.personal_records (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  exercise_id uuid        references public.exercises(id) not null,
  value       numeric     not null,
  unit        text        not null,
  achieved_at timestamptz default now() not null,
  session_id  uuid        references public.workout_sessions(id),
  unique (user_id, exercise_id)
);

-- Enable RLS (idempotent)
alter table public.exercises        enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets     enable row level security;
alter table public.personal_records enable row level security;

-- Policies (drop first to avoid duplicate errors)
do $$ begin
  drop policy if exists "read exercises"      on public.exercises;
  drop policy if exists "manage own exercises" on public.exercises;
  drop policy if exists "delete own exercises" on public.exercises;
  drop policy if exists "own sessions"         on public.workout_sessions;
  drop policy if exists "own sets"             on public.workout_sets;
  drop policy if exists "own prs"              on public.personal_records;
end $$;

create policy "read exercises"
  on public.exercises for select using (user_id is null or auth.uid() = user_id);
create policy "manage own exercises"
  on public.exercises for insert with check (auth.uid() = user_id);
create policy "delete own exercises"
  on public.exercises for delete using (auth.uid() = user_id);
create policy "own sessions"
  on public.workout_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sets"
  on public.workout_sets for all
  using (auth.uid() = (select user_id from public.workout_sessions where id = session_id));
create policy "own prs"
  on public.personal_records for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed global exercises only if none exist yet
insert into public.exercises (name, category, type)
select name, category, type from (values
  ('Bench Press',          'push',      'strength'),
  ('Incline Bench Press',  'push',      'strength'),
  ('Overhead Press',       'push',      'strength'),
  ('Dumbbell Fly',         'push',      'strength'),
  ('Push Ups',             'push',      'bodyweight'),
  ('Dips',                 'push',      'bodyweight'),
  ('Pull Ups',             'pull',      'bodyweight'),
  ('Chin Ups',             'pull',      'bodyweight'),
  ('Barbell Row',          'pull',      'strength'),
  ('Lat Pulldown',         'pull',      'strength'),
  ('Seated Cable Row',     'pull',      'strength'),
  ('Face Pull',            'pull',      'strength'),
  ('Squat',                'legs',      'strength'),
  ('Deadlift',             'legs',      'strength'),
  ('Romanian Deadlift',    'legs',      'strength'),
  ('Leg Press',            'legs',      'strength'),
  ('Lunges',               'legs',      'bodyweight'),
  ('Leg Curl',             'legs',      'strength'),
  ('Leg Extension',        'legs',      'strength'),
  ('Calf Raises',          'legs',      'strength'),
  ('Plank',                'core',      'bodyweight'),
  ('Crunches',             'core',      'bodyweight'),
  ('Hanging Leg Raises',   'core',      'bodyweight'),
  ('Russian Twists',       'core',      'bodyweight'),
  ('Cable Crunch',         'core',      'strength'),
  ('Running',              'cardio',    'cardio'),
  ('Cycling',              'cardio',    'cardio'),
  ('Jump Rope',            'cardio',    'cardio'),
  ('Burpees',              'full_body', 'bodyweight'),
  ('Clean and Press',      'full_body', 'strength')
) as v(name, category, type)
where not exists (select 1 from public.exercises where user_id is null limit 1);
