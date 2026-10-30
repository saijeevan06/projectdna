alter table public.demo_registrations
  add column if not exists academic_year text;

alter table public.demo_registrations
  drop constraint if exists demo_registration_student_fields;

alter table public.demo_registrations
  add constraint demo_registration_academic_year_check
  check (academic_year is null or academic_year in ('1st year', '2nd year', '3rd year', '4th year', '5th year', 'Other'));

alter table public.demo_registrations
  add constraint demo_registration_student_fields
  check (
    (user_type = 'student' and branch is not null and academic_year is not null and final_year_engineering is not null)
    or (user_type = 'developer' and branch is null and academic_year is null and final_year_engineering is null)
  );

drop function if exists public.register_demo_registration(text, text, text, text, text, text, boolean, text, text, text, uuid, boolean, text);

create function public.register_demo_registration(
  p_campaign_id text,
  p_full_name text,
  p_email text,
  p_college text,
  p_user_type text,
  p_branch text,
  p_academic_year text,
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
    academic_year, final_year_engineering, selected_project, source, path, consent_at
  ) values (
    p_campaign_id, trim(p_full_name), normalized_email, trim(p_college), p_user_type,
    p_branch, p_academic_year, p_final_year_engineering, nullif(trim(p_selected_project), ''), p_source, p_path, now()
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

revoke all on function public.register_demo_registration(text, text, text, text, text, text, text, boolean, text, text, text, uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.register_demo_registration(text, text, text, text, text, text, text, boolean, text, text, text, uuid, boolean, text) to service_role;
