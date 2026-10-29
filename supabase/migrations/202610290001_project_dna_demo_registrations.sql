create table if not exists public.demo_registrations (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null,
  full_name text not null,
  normalized_email text not null,
  college text not null,
  user_type text not null check (user_type in ('student', 'developer')),
  branch text check (branch is null or branch in ('CSE', 'IT', 'AI/ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other')),
  final_year_engineering boolean,
  eligible_student_self_reported boolean generated always as (user_type = 'student' and final_year_engineering is true) stored,
  selected_project text,
  source text not null default 'direct_unknown',
  path text not null check (path in ('unknown', 'improve', 'discover')),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint demo_registration_student_fields check (
    (user_type = 'student' and branch is not null and final_year_engineering is not null)
    or (user_type = 'developer' and branch is null and final_year_engineering is null)
  ),
  constraint demo_registration_campaign_email_unique unique (campaign_id, normalized_email)
);

create table if not exists public.project_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null,
  session_id uuid not null,
  event_name text not null check (event_name in ('landing', 'path_start', 'result', 'workshop_cta_click', 'registration_form_start', 'registration_saved')),
  source text not null default 'direct_unknown',
  path text not null check (path in ('unknown', 'improve', 'discover')),
  created_at timestamptz not null default now()
);

alter table public.demo_registrations enable row level security;
alter table public.project_events enable row level security;
revoke all on public.demo_registrations from anon, authenticated;
revoke all on public.project_events from anon, authenticated;
grant all on public.demo_registrations to service_role;
grant all on public.project_events to service_role;

create or replace function public.record_project_event(
  p_campaign_id text,
  p_session_id uuid,
  p_event_name text,
  p_source text,
  p_path text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event_name not in ('landing', 'path_start', 'result', 'workshop_cta_click', 'registration_form_start') then
    raise exception 'unsupported event';
  end if;
  insert into public.project_events (campaign_id, session_id, event_name, source, path)
  values (p_campaign_id, p_session_id, p_event_name, p_source, p_path);
end;
$$;

create or replace function public.register_demo_registration(
  p_campaign_id text,
  p_full_name text,
  p_email text,
  p_college text,
  p_user_type text,
  p_branch text,
  p_final_year_engineering boolean,
  p_selected_project text,
  p_source text,
  p_path text,
  p_session_id uuid,
  p_consent boolean
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
begin
  if not p_consent then raise exception 'consent required'; end if;
  insert into public.demo_registrations (
    campaign_id, full_name, normalized_email, college, user_type, branch,
    final_year_engineering, selected_project, source, path, consent_at
  ) values (
    p_campaign_id, trim(p_full_name), lower(trim(p_email)), trim(p_college), p_user_type,
    p_branch, p_final_year_engineering, nullif(trim(p_selected_project), ''), p_source, p_path, now()
  ) on conflict (campaign_id, normalized_email) do nothing
  returning id into inserted_id;

  if inserted_id is null then return 'duplicate'; end if;

  insert into public.project_events (campaign_id, session_id, event_name, source, path)
  values (p_campaign_id, p_session_id, 'registration_saved', p_source, p_path);
  return 'saved';
end;
$$;

revoke all on function public.record_project_event(text, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.register_demo_registration(text, text, text, text, text, text, boolean, text, text, text, uuid, boolean) from public, anon, authenticated;
grant execute on function public.record_project_event(text, uuid, text, text, text) to service_role;
grant execute on function public.register_demo_registration(text, text, text, text, text, text, boolean, text, text, text, uuid, boolean) to service_role;
