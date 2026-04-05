-- Migration 00021: Auto-generate rolling 7-day counselling slots
--
-- Problem: Slots were manually created by admins. Students see "No slots available"
-- if admin forgets to create them.
--
-- Solution: A DB function that ensures the next 7 days always have slots
-- (10:00 AM to 9:00 PM, 1-hour intervals). Called on-demand from the API.
-- Uses ON CONFLICT to avoid duplicates.

-- 1. Allow created_by to be NULL for system-generated slots
ALTER TABLE public.counselling_slots
  ALTER COLUMN created_by DROP NOT NULL;

-- 2. Create the auto-generation function
CREATE OR REPLACE FUNCTION public.ensure_upcoming_slots(p_days INTEGER DEFAULT 7)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_day       DATE;
  v_hour      INTEGER;
  v_inserted  INTEGER := 0;
BEGIN
  -- Loop through the next p_days days (including today)
  FOR i IN 0..(p_days - 1) LOOP
    v_day := CURRENT_DATE + i;

    -- Generate hourly slots from 10:00 to 21:00 (last slot starts at 21:00)
    FOR v_hour IN 10..21 LOOP
      INSERT INTO public.counselling_slots (
        slot_date,
        slot_time,
        max_capacity,
        booked_count,
        is_available,
        created_by
      ) VALUES (
        v_day,
        make_time(v_hour, 0, 0),   -- e.g. 10:00:00, 11:00:00, ...
        1,                          -- default capacity of 1
        0,
        true,
        NULL                        -- system-generated (no admin creator)
      )
      ON CONFLICT (slot_date, slot_time) DO NOTHING;

      -- Count rows actually inserted (not skipped)
      IF FOUND THEN
        v_inserted := v_inserted + 1;
      END IF;
    END LOOP;
  END LOOP;

  RETURN v_inserted;
END;
$$;
