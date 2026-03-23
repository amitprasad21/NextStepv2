-- Migration 00018: Add unique constraint to prevent duplicate active visits
-- and add meeting_link column to bookings if missing.

-- Prevent same student visiting same college on same date (unless cancelled)
CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_no_duplicate
  ON public.college_visits (student_id, college_id, visit_date)
  WHERE status != 'cancelled';

-- Ensure meeting_link column exists on counselling_bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'counselling_bookings'
      AND column_name = 'meeting_link'
  ) THEN
    ALTER TABLE public.counselling_bookings ADD COLUMN meeting_link TEXT;
  END IF;
END $$;
