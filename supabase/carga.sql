-- ============================================================
-- Carga · tablas extra para el MISMO proyecto de Supabase de Tráguese ese sapo
-- Pégalo en Supabase → SQL Editor → New query → Run.
-- Solo AGREGA una tabla nueva: no borra ni cambia nada de lo que ya tienes.
-- Los entrenamientos se guardan en la tabla "workouts" que ya existe,
-- así también aparecen en el progreso de Tráguese ese sapo.
-- ============================================================

-- Rutinas que armas tú (plantillas)
create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  notes text,
  exercises jsonb not null default '[]',  -- [{ id, sets, reps, rest_sec, note }]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists workout_templates_user on public.workout_templates(user_id);

alter table public.workout_templates enable row level security;

drop policy if exists "datos propios" on public.workout_templates;
create policy "datos propios" on public.workout_templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
