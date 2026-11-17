-- docs/supabase_schema.sql
-- Script SQL para Supabase (LAB-06) - Recurso protegido con Row Level Security (RLS)
-- Proyecto: UniAccess URP (Áreas deportivas CESPAR)

-- 1. Crear tabla de reportes e incidencias vinculada a usuarios de Supabase Auth
create table if not exists reportes (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo      text not null,
  descripcion text,
  categoria   text default 'infraestructura',
  creado_en   timestamptz not null default now()
);

-- 2. Habilitar Row Level Security (RLS)
alter table reportes enable row level security;

-- 3. Política para que cada usuario autenticado SOLO pueda consultar sus propias filas
drop policy if exists "cada usuario lee sus reportes" on reportes;
create policy "cada usuario lee sus reportes"
  on reportes for select
  using (auth.uid() = user_id);

-- 4. Política para que cada usuario SOLO pueda insertar filas con su propio auth.uid()
drop policy if exists "cada usuario crea sus reportes" on reportes;
create policy "cada usuario crea sus reportes"
  on reportes for insert
  with check (auth.uid() = user_id);
