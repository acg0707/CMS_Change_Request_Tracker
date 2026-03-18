create extension if not exists pgcrypto;

create table if not exists public.clinics (
  clinic_id uuid primary key default gen_random_uuid(),
  clinic_name text not null,
  base_url text not null,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  phone text,
  public_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key,
  role text not null,
  clinic_id uuid,
  full_name text,
  position text,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  ticket_id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null,
  created_by_user_id uuid not null,
  page text not null,
  page_url text not null,
  status text not null,
  assigned_to text,
  client_review_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  issue text not null,
  description text not null
);

create table if not exists public.comments (
  comment_id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null,
  author_user_id uuid not null,
  visibility text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attachments (
  attachment_id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null,
  uploaded_by_user_id uuid not null,
  file_url text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid,
  ticket_id uuid,
  recipient_role text not null,
  recipient_clinic_id uuid,
  actor_user_id uuid,
  actor_label text,
  type text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);