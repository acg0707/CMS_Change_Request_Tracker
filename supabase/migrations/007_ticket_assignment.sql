-- Ticket assignment: assigned_to uuid referencing auth.users.id
-- No direct FK from tickets to profiles; assignee display resolved via profiles.user_id in app.
-- Handles: (A) assigned_to text from 001, (B) assigned_to_user_id from previous 007 version.

DO $$
BEGIN
  -- Case B: migrate from assigned_to_user_id (our previous implementation)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tickets' AND column_name='assigned_to_user_id') THEN
    ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS assigned_to uuid;
    UPDATE public.tickets SET assigned_to = assigned_to_user_id WHERE assigned_to_user_id IS NOT NULL;
    ALTER TABLE public.tickets DROP COLUMN assigned_to_user_id;
  -- Case A: replace assigned_to text (from 001) with uuid
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tickets' AND column_name='assigned_to') THEN
    ALTER TABLE public.tickets DROP COLUMN assigned_to;
    ALTER TABLE public.tickets ADD COLUMN assigned_to uuid;
  -- Column missing; add it
  ELSE
    ALTER TABLE public.tickets ADD COLUMN assigned_to uuid;
  END IF;
END $$;

-- Add FK to auth.users (no direct tickets->profiles FK)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_assigned_to_fkey') THEN
    ALTER TABLE public.tickets ADD CONSTRAINT tickets_assigned_to_fkey
      FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
