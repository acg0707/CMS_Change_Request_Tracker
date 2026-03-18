alter table public.profiles
  add constraint profiles_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade,
  add constraint profiles_clinic_id_fkey
    foreign key (clinic_id) references public.clinics(clinic_id) on delete set null,
  add constraint profiles_role_check
    check (role in ('clinic','internal'));

alter table public.tickets
  add constraint tickets_clinic_id_fkey
    foreign key (clinic_id) references public.clinics(clinic_id) on delete restrict,
  add constraint tickets_created_by_user_id_fkey
    foreign key (created_by_user_id) references auth.users(id) on delete restrict,
  add constraint tickets_page_check
    check (page in ('homepage','services','team','banner','other')),
  add constraint tickets_status_check
    check (status in ('Pending','In progress','Needs dev change','Client review','Follow up needed','Resolved'));

alter table public.comments
  add constraint comments_ticket_id_fkey
    foreign key (ticket_id) references public.tickets(ticket_id) on delete cascade,
  add constraint comments_author_user_id_fkey
    foreign key (author_user_id) references auth.users(id) on delete restrict,
  add constraint comments_visibility_check
    check (visibility in ('clinic_visible','internal'));

alter table public.attachments
  add constraint attachments_ticket_id_fkey
    foreign key (ticket_id) references public.tickets(ticket_id) on delete cascade,
  add constraint attachments_uploaded_by_user_id_fkey
    foreign key (uploaded_by_user_id) references auth.users(id) on delete restrict;

alter table public.notifications
  add constraint notifications_clinic_id_fkey
    foreign key (clinic_id) references public.clinics(clinic_id),
  add constraint notifications_ticket_id_fkey
    foreign key (ticket_id) references public.tickets(ticket_id),
  add constraint notifications_recipient_clinic_id_fkey
    foreign key (recipient_clinic_id) references public.clinics(clinic_id),
  add constraint notifications_actor_user_id_fkey
    foreign key (actor_user_id) references auth.users(id),
  add constraint notifications_recipient_role_check
    check (recipient_role in ('clinic','internal')),
  add constraint notifications_type_check
    check (type in ('ticket_created','status_changed','comment_added','followup_requested'));

drop trigger if exists set_tickets_updated_at on public.tickets;
create trigger set_tickets_updated_at
before update on public.tickets
for each row
execute function public.set_updated_at();