-- ============================================================
-- Migración: multi-kiosco (tabla kioscos + kiosco_id en deudores)
-- Ejecutar una sola vez en el SQL Editor de Supabase
-- ============================================================

-- Tabla de kioscos
create table if not exists kioscos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug_acceso text not null unique,
  created_at timestamptz not null default now()
);

-- Kiosco por defecto, para no romper datos que ya existían
-- antes de esta migración (deudores sin kiosco asignado)
insert into kioscos (nombre, slug_acceso)
values ('Kiosco principal', 'kiosco-principal-0000')
on conflict (slug_acceso) do nothing;

-- Columna kiosco_id en deudores
alter table deudores
  add column if not exists kiosco_id uuid references kioscos(id);

-- Asignar el kiosco por defecto a deudores existentes sin kiosco
update deudores
set kiosco_id = (select id from kioscos where slug_acceso = 'kiosco-principal-0000')
where kiosco_id is null;

-- Índice para filtrar rápido por kiosco
create index if not exists idx_deudores_kiosco_id on deudores(kiosco_id);

-- ============================================================
-- Nota: este script es idempotente (se puede correr más de una
-- vez sin generar duplicados ni errores).
-- ============================================================