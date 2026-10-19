-- Desafio Corpo e Espírito · GC Samambaia
-- Rode este arquivo inteiro no SQL Editor do Supabase (uma vez só).

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text not null,
  pin_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  day int not null check (day between 1 and 28),
  kind text not null check (kind in ('leitura', 'treino')),
  activity text,
  minutes int,
  photo_url text,
  caption text,
  created_at timestamptz not null default now(),
  unique (participant_id, day, kind)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  day int not null check (day between 1 and 28),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

-- Grupo interno de amigos: qualquer pessoa com o link lê e escreve.
alter table participants enable row level security;
alter table checkins enable row level security;
alter table comments enable row level security;

create policy "aberto" on participants for all to anon using (true) with check (true);
create policy "aberto" on checkins for all to anon using (true) with check (true);
create policy "aberto" on comments for all to anon using (true) with check (true);

grant select, insert, update, delete on participants, checkins, comments to anon;

-- Fotos (perfil e treinos)
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

create policy "fotos leitura" on storage.objects for select to anon using (bucket_id = 'fotos');
create policy "fotos envio" on storage.objects for insert to anon with check (bucket_id = 'fotos');
