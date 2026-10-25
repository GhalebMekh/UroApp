-- UroApp accounts: profiles + cloud backup.
-- Run once in the Supabase dashboard → SQL Editor (see docs/ACCOUNTS_SETUP.md).
--
-- Every table has row-level security: a signed-in user can read and write
-- only their own rows. The app ships the publishable key, so RLS — not the
-- app — is what keeps one doctor's logbook away from another.

-- ── Profiles: about the clinician, never about patients ─────────────────────
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text check (char_length(display_name) <= 80),
  role          text check (role in ('r1', 'r2', 'r3', 'r4', 'r5', 'fellow', 'specialist', 'consultant')),
  institution   text check (char_length(institution) <= 120),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own"   on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: insert own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles: update own" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- ── Synced app data: one JSON document per storage key ──────────────────────
-- The key list is the server-side guarantee of the owner's rule that the ward
-- list ('uroapp.rounding.v1') and MDT case sheets ('uroapp.mdt.v1') — which hold
-- initials, ages and clinical detail — are never stored in the cloud.
create table public.user_data (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key         text not null check (key in (
                'uroapp.oplog.v1',
                'uroapp.cme.v1',
                'uroapp.cme.target.v1',
                'uroapp.tools.v1',
                'uroapp.rehearsal.v1'
              )),
  value       jsonb not null check (octet_length(value::text) <= 2000000),
  version     integer not null default 1 check (version >= 1),
  updated_at  timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_data enable row level security;

create policy "user_data: read own"   on public.user_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_data: insert own" on public.user_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_data: update own" on public.user_data for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_data: delete own" on public.user_data for delete to authenticated using ((select auth.uid()) = user_id);

-- ── In-app account deletion (App Store guideline 5.1.1(v)) ───────────────────
-- Deletes the caller's login; profiles and user_data go with it (on delete
-- cascade). security definer because users cannot delete from auth.users
-- themselves; it only ever touches the caller's own id.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
