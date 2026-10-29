create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.demo_registrations(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{12}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.referral_attributions (
  referred_registration_id uuid primary key references public.demo_registrations(id) on delete cascade,
  referrer_registration_id uuid not null references public.demo_registrations(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint referral_not_self check (referred_registration_id <> referrer_registration_id)
);

create index if not exists referral_attributions_referrer_idx on public.referral_attributions(referrer_registration_id);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.referral_codes enable row level security;
alter table public.referral_attributions enable row level security;
alter table public.admin_users enable row level security;
revoke all on public.referral_codes from anon, authenticated;
revoke all on public.referral_attributions from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;
grant all on public.referral_codes to service_role;
grant all on public.referral_attributions to service_role;
grant all on public.admin_users to service_role;

insert into public.referral_codes (registration_id, code)
select registration.id, upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
from public.demo_registrations as registration
on conflict (registration_id) do nothing;

drop function if exists public.register_demo_registration(text, text, text, text, text, text, boolean, text, text, text, uuid, boolean);

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
  p_consent boolean,
  p_referral_code text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
  normalized_email text := lower(trim(p_email));
  referred_by uuid;
  referred_email text;
  new_code text;
  referral_total integer;
  was_attributed boolean := false;
begin
  if not p_consent then raise exception 'consent required'; end if;
  insert into public.demo_registrations (
    campaign_id, full_name, normalized_email, college, user_type, branch,
    final_year_engineering, selected_project, source, path, consent_at
  ) values (
    p_campaign_id, trim(p_full_name), normalized_email, trim(p_college), p_user_type,
    p_branch, p_final_year_engineering, nullif(trim(p_selected_project), ''), p_source, p_path, now()
  ) on conflict (campaign_id, normalized_email) do nothing
  returning id into inserted_id;

  if inserted_id is null then
    select registration.id, referral.code into inserted_id, new_code
    from public.demo_registrations as registration
    join public.referral_codes as referral on referral.registration_id = registration.id
    where registration.campaign_id = p_campaign_id and registration.normalized_email = normalized_email;
    select count(*)::integer into referral_total from public.referral_attributions where referrer_registration_id = inserted_id;
    return jsonb_build_object('status', 'duplicate', 'referralCode', new_code, 'referralCount', coalesce(referral_total, 0), 'referralAttributed', false);
  end if;

  if p_referral_code ~ '^[A-Za-z0-9]{12}$' then
    select registration.id, registration.normalized_email into referred_by, referred_email
    from public.referral_codes as referral
    join public.demo_registrations as registration on registration.id = referral.registration_id
    where referral.code = upper(p_referral_code) and registration.campaign_id = p_campaign_id;
    if referred_by is not null and referred_email <> normalized_email then
      insert into public.referral_attributions (referred_registration_id, referrer_registration_id)
      values (inserted_id, referred_by)
      on conflict (referred_registration_id) do nothing;
      was_attributed := true;
    end if;
  end if;

  loop
    new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
    insert into public.referral_codes (registration_id, code)
    values (inserted_id, new_code)
    on conflict do nothing;
    exit when found;
  end loop;

  insert into public.project_events (campaign_id, session_id, event_name, source, path)
  values (p_campaign_id, p_session_id, 'registration_saved', p_source, p_path);
  select count(*)::integer into referral_total from public.referral_attributions where referrer_registration_id = inserted_id;
  return jsonb_build_object('status', 'saved', 'referralCode', new_code, 'referralCount', coalesce(referral_total, 0), 'referralAttributed', was_attributed);
end;
$$;

create or replace function public.get_referral_progress(p_code text, p_campaign_id text)
returns integer
language sql
security definer
set search_path = public
as $$
  select count(attribution.referred_registration_id)::integer
  from public.referral_codes as referral
  join public.demo_registrations as registration on registration.id = referral.registration_id
  left join public.referral_attributions as attribution on attribution.referrer_registration_id = registration.id
  where referral.code = upper(p_code) and registration.campaign_id = p_campaign_id;
$$;

create or replace function public.admin_campaign_metrics(p_user_id uuid, p_campaign_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  total_registrations integer;
  eligible_registrations integer;
begin
  if not exists (select 1 from public.admin_users where user_id = p_user_id and is_active) then
    raise exception 'not authorized';
  end if;

  select count(*)::integer, count(*) filter (where eligible_student_self_reported)::integer
    into total_registrations, eligible_registrations
  from public.demo_registrations where campaign_id = p_campaign_id;

  return jsonb_build_object(
    'registrations', jsonb_build_object('total', coalesce(total_registrations, 0), 'eligibleSelfReported', coalesce(eligible_registrations, 0), 'otherDemo', coalesce(total_registrations - eligible_registrations, 0)),
    'sources', coalesce((
      select jsonb_agg(jsonb_build_object('source', grouped.source, 'count', grouped.count) order by grouped.count desc, grouped.source)
      from (select source, count(*)::integer as count from public.demo_registrations where campaign_id = p_campaign_id group by source) as grouped
    ), '[]'::jsonb),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('date', to_char(days.day, 'YYYY-MM-DD'), 'count', days.count) order by days.day)
      from (
        select generated.day::date as day, count(registration.id)::integer as count
        from generate_series(current_date - 13, current_date, interval '1 day') as generated(day)
        left join public.demo_registrations as registration on registration.created_at::date = generated.day::date and registration.campaign_id = p_campaign_id
        group by generated.day::date
      ) as days
    ), '[]'::jsonb),
    'funnel', jsonb_build_object(
      'landing', (select count(distinct session_id)::integer from public.project_events where campaign_id = p_campaign_id and event_name = 'landing'),
      'pathStart', (select count(distinct session_id)::integer from public.project_events where campaign_id = p_campaign_id and event_name = 'path_start'),
      'result', (select count(distinct session_id)::integer from public.project_events where campaign_id = p_campaign_id and event_name = 'result'),
      'workshopCtaClick', (select count(distinct session_id)::integer from public.project_events where campaign_id = p_campaign_id and event_name = 'workshop_cta_click'),
      'registrationFormStart', (select count(distinct session_id)::integer from public.project_events where campaign_id = p_campaign_id and event_name = 'registration_form_start'),
      'registrationSaved', (select count(*)::integer from public.demo_registrations where campaign_id = p_campaign_id)
    ),
    'referralRegistrations', (select count(*)::integer from public.referral_attributions as attribution join public.demo_registrations as referred on referred.id = attribution.referred_registration_id where referred.campaign_id = p_campaign_id)
  );
end;
$$;

revoke all on function public.register_demo_registration(text, text, text, text, text, text, boolean, text, text, text, uuid, boolean, text) from public, anon, authenticated;
revoke all on function public.get_referral_progress(text, text) from public, anon, authenticated;
revoke all on function public.admin_campaign_metrics(uuid, text) from public, anon, authenticated;
grant execute on function public.register_demo_registration(text, text, text, text, text, text, boolean, text, text, text, uuid, boolean, text) to service_role;
grant execute on function public.get_referral_progress(text, text) to service_role;
grant execute on function public.admin_campaign_metrics(uuid, text) to service_role;
