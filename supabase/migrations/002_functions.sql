create or replace function public.current_clinic_id()
returns uuid
language sql
stable
security definer
as $$
  select clinic_id
  from public.profiles
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public."current_role"()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text
  from public.profiles
  where user_id = auth.uid();
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
as $$
  select role
  from public.profiles
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_access_ticket(p_ticket_id uuid)
returns boolean
language sql
stable
as $$
  select
    public."current_role"() = 'internal'
    or exists (
      select 1
      from public.tickets t
      where t.ticket_id = p_ticket_id
        and t.clinic_id = public.current_clinic_id()
    );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;