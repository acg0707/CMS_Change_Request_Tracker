insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy storage_delete_attachments_internal_only
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'attachments'
  and "current_role"() = 'internal'
);

create policy storage_insert_attachments
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'attachments'
  and can_access_ticket((split_part(name, '/', 1))::uuid)
);

create policy storage_read_attachments
on storage.objects
for select
to authenticated
using (
  bucket_id = 'attachments'
  and (
    "current_role"() = 'internal'
    or exists (
      select 1
      from public.attachments a
      join public.tickets t on t.ticket_id = a.ticket_id
      where a.file_url = objects.name
        and t.clinic_id = current_clinic_id()
    )
  )
);