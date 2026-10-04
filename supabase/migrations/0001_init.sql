-- Phase 1 schema: users (profile), templates, sites, leads.
-- Run in the Supabase SQL editor, or with `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users: one profile row per Supabase Auth user
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- Create the profile row automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for anyone who signed up before this migration ran.
insert into public.users (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- templates: seeded by hand, one row per human-designed template
-- ---------------------------------------------------------------------------
create table public.templates (
  id text primary key,                -- matches the folder name in /templates
  name text not null,
  style text not null check (style in ('modern', 'traditional', 'colorful')),
  slot_schema_json jsonb not null,
  thumbnail_url text
);

-- ---------------------------------------------------------------------------
-- sites
-- ---------------------------------------------------------------------------
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  template_id text not null references public.templates (id),
  business_name text not null,
  city text not null,
  business_type text not null,
  style text not null check (style in ('modern', 'traditional', 'colorful')),
  palette text not null,
  owner_notes text,                   -- optional "anything special?" text from the owner, fed to the AI
  content_json jsonb,
  images_json jsonb not null default '{}'::jsonb,
  place_id text,                      -- Google Places id, when imported from a Maps / Business Profile link
  place_json jsonb,                   -- address, phone, hours, rating and photo credits from Google
  prompt_count int not null default 0 check (prompt_count >= 0),
  status text not null default 'draft' check (status in ('draft', 'previewing', 'published')),
  live_url text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index sites_user_id_idx on public.sites (user_id);

-- ---------------------------------------------------------------------------
-- leads: written by the public /api/leads route (service role), read by owners
-- ---------------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  message text not null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

create index leads_site_id_created_at_idx on public.leads (site_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.templates enable row level security;
alter table public.sites enable row level security;
alter table public.leads enable row level security;

create policy "users: read own profile" on public.users
  for select using ((select auth.uid()) = id);

create policy "templates: anyone can read" on public.templates
  for select using (true);

create policy "sites: owner reads" on public.sites
  for select using ((select auth.uid()) = user_id);
create policy "sites: owner inserts" on public.sites
  for insert with check ((select auth.uid()) = user_id);
create policy "sites: owner updates" on public.sites
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "sites: owner deletes" on public.sites
  for delete using ((select auth.uid()) = user_id);

-- Owners can read and mark-as-read their leads. Inserts come only from the
-- server using the service role key, which bypasses RLS.
create policy "leads: owner reads" on public.leads
  for select using (
    exists (select 1 from public.sites s where s.id = site_id and s.user_id = (select auth.uid()))
  );
create policy "leads: owner updates" on public.leads
  for update using (
    exists (select 1 from public.sites s where s.id = site_id and s.user_id = (select auth.uid()))
  );

-- Owners must not be able to change prompt_count, content or publish state
-- directly from the browser; those columns are only written server-side.
-- (A column-level revoke does not override Supabase's table-level grant, so
-- revoke the table grant and re-grant the safe columns.)
revoke update on public.sites from authenticated;
grant update (business_name, city, business_type, style, palette, owner_notes, template_id, images_json)
  on public.sites to authenticated;
-- Owners may only flip is_read on leads.
revoke update on public.leads from authenticated;
grant update (is_read) on public.leads to authenticated;

-- Realtime for the lead dashboard (Phase 5).
alter publication supabase_realtime add table public.leads;

-- ---------------------------------------------------------------------------
-- AI content: saved through this function so owners can't edit content_json
-- or reset prompt_count directly. Edits are capped at 10 per site.
-- ---------------------------------------------------------------------------
create or replace function public.save_site_content(p_site_id uuid, p_content jsonb, p_is_edit boolean)
returns int
language plpgsql
security definer set search_path = ''
as $$
declare
  max_edits constant int := 10;
  used int;
begin
  update public.sites
     set content_json = p_content,
         prompt_count = prompt_count + case when p_is_edit then 1 else 0 end,
         status = case when status = 'draft' then 'previewing' else status end
   where id = p_site_id
     and user_id = (select auth.uid())
     and (not p_is_edit or prompt_count < max_edits)
  returning prompt_count into used;

  if not found then
    raise exception 'Site not found, or the edit limit is reached';
  end if;
  return max_edits - used; -- edits left
end;
$$;

revoke execute on function public.save_site_content(uuid, jsonb, boolean) from public, anon;
grant execute on function public.save_site_content(uuid, jsonb, boolean) to authenticated;
