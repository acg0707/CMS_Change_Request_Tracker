-- clinics
create policy clinics_select_internal_or_own
on public.clinics
for select
to authenticated
using (("current_role"() = 'internal') or (clinic_id = current_clinic_id()));

create policy clinics_write_internal_only
on public.clinics
for all
to authenticated
using ("current_role"() = 'internal')
with check ("current_role"() = 'internal');

-- profiles
create policy profiles_insert_self
on public.profiles
for insert
to authenticated
with check (user_id = auth.uid());

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

create policy profiles_update_self
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- tickets
create policy tickets_insert_clinic_or_internal
on public.tickets
for insert
to authenticated
with check (
  ("current_role"() = 'internal')
  or (
    ("current_role"() = 'clinic')
    and clinic_id = current_clinic_id()
    and created_by_user_id = auth.uid()
    and status = 'Pending'
  )
);

create policy tickets_select_internal_or_own_clinic
on public.tickets
for select
to authenticated
using (("current_role"() = 'internal') or (clinic_id = current_clinic_id()));

create policy tickets_update_internal_only
on public.tickets
for update
to authenticated
using ("current_role"() = 'internal')
with check ("current_role"() = 'internal');

-- comments
create policy comments_delete_internal_only
on public.comments
for delete
to authenticated
using ("current_role"() = 'internal');

create policy comments_insert_internal_or_clinic_visible
on public.comments
for insert
to authenticated
with check (
  ("current_role"() = 'internal')
  or (
    ("current_role"() = 'clinic')
    and visibility = 'clinic_visible'
    and author_user_id = auth.uid()
    and exists (
      select 1 from public.tickets t
      where t.ticket_id = comments.ticket_id
        and t.clinic_id = current_clinic_id()
    )
  )
);

create policy comments_select_internal_or_clinic_visible
on public.comments
for select
to authenticated
using (
  ("current_role"() = 'internal')
  or (
    visibility = 'clinic_visible'
    and exists (
      select 1 from public.tickets t
      where t.ticket_id = comments.ticket_id
        and t.clinic_id = current_clinic_id()
    )
  )
);

create policy comments_update_internal_only
on public.comments
for update
to authenticated
using ("current_role"() = 'internal')
with check ("current_role"() = 'internal');

-- attachments
create policy attachments_delete_internal_only
on public.attachments
for delete
to authenticated
using ("current_role"() = 'internal');

create policy attachments_insert_internal_or_own_clinic
on public.attachments
for insert
to authenticated
with check (
  ("current_role"() = 'internal')
  or (
    ("current_role"() = 'clinic')
    and uploaded_by_user_id = auth.uid()
    and exists (
      select 1 from public.tickets t
      where t.ticket_id = attachments.ticket_id
        and t.clinic_id = current_clinic_id()
    )
  )
);

create policy attachments_select_internal_or_own_clinic
on public.attachments
for select
to authenticated
using (
  ("current_role"() = 'internal')
  or exists (
    select 1 from public.tickets t
    where t.ticket_id = attachments.ticket_id
      and t.clinic_id = current_clinic_id()
  )
);

create policy attachments_update_internal_only
on public.attachments
for update
to authenticated
using ("current_role"() = 'internal')
with check ("current_role"() = 'internal');

-- notifications
create policy clinic_select_notifications
on public.notifications
for select
to authenticated
using (
  recipient_role = 'clinic'
  and recipient_clinic_id = current_clinic_id()
);

create policy clinic_update_notifications
on public.notifications
for update
to authenticated
using (
  recipient_role = 'clinic'
  and recipient_clinic_id = current_clinic_id()
)
with check (
  recipient_role = 'clinic'
  and recipient_clinic_id = current_clinic_id()
);

create policy internal_select_notifications
on public.notifications
for select
to authenticated
using (
  recipient_role = 'internal'
  or current_user_role() = 'internal'
);

create policy internal_update_notifications
on public.notifications
for update
to authenticated
using (
  recipient_role = 'internal'
  or current_user_role() = 'internal'
);

create policy internal_delete_notifications
on public.notifications
for delete
to authenticated
using (
  recipient_role = 'internal'
  or current_user_role() = 'internal'
);