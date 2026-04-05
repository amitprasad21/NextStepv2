-- Migration 00019: Atomic RPC functions for race-condition-free operations
-- Covers: booking creation, visit creation, and cascade college deletion.

-- ============================================================
-- 1. ATOMIC BOOKING: capacity check + insert + slot update + credit
--    in one transaction with row-level locking.
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_student_id      UUID,
  p_slot_id         UUID,
  p_booking_type    TEXT,
  p_context_college_id UUID,
  p_preferred_date  DATE,
  p_preferred_time  TIME,
  p_use_purchased   BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot           RECORD;
  v_booking_id     UUID;
  v_existing_count BIGINT;
BEGIN
  -- Lock the slot row to prevent concurrent over-booking
  SELECT * INTO v_slot
  FROM public.counselling_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF v_slot IS NULL THEN
    RETURN jsonb_build_object('error', 'Slot not found', 'status', 404);
  END IF;

  IF NOT v_slot.is_available THEN
    RETURN jsonb_build_object('error', 'This slot is no longer available', 'status', 409);
  END IF;

  IF v_slot.booked_count >= v_slot.max_capacity THEN
    RETURN jsonb_build_object('error', 'This slot is fully booked', 'status', 409);
  END IF;

  -- Check for duplicate active booking
  SELECT COUNT(*) INTO v_existing_count
  FROM public.counselling_bookings
  WHERE student_id = p_student_id
    AND slot_id = p_slot_id
    AND status != 'cancelled';

  IF v_existing_count > 0 THEN
    RETURN jsonb_build_object('error', 'You already have a booking at this time.', 'status', 409);
  END IF;

  -- Insert booking
  INSERT INTO public.counselling_bookings (
    student_id, slot_id, booking_type, context_college_id,
    preferred_date, preferred_time, status
  ) VALUES (
    p_student_id, p_slot_id, p_booking_type, p_context_college_id,
    p_preferred_date, p_preferred_time, 'pending'
  )
  RETURNING id INTO v_booking_id;

  -- Increment booked_count and update availability
  UPDATE public.counselling_slots
  SET booked_count = booked_count + 1,
      is_available = (booked_count + 1 < max_capacity)
  WHERE id = p_slot_id;

  -- Adjust credits atomically
  IF p_use_purchased THEN
    UPDATE public.student_profiles
    SET purchased_counselling = GREATEST(purchased_counselling - 1, 0)
    WHERE user_id = p_student_id;
  ELSE
    UPDATE public.student_profiles
    SET used_free_counselling = COALESCE(used_free_counselling, 0) + 1
    WHERE user_id = p_student_id;
  END IF;

  RETURN jsonb_build_object('booking_id', v_booking_id, 'status', 201);
END;
$$;


-- ============================================================
-- 2. ATOMIC VISIT: capacity check + insert + credit
--    in one transaction.
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_visit_atomic(
  p_student_id   UUID,
  p_college_id   UUID,
  p_visit_date   DATE,
  p_visit_time   TIME,
  p_use_purchased BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_college        RECORD;
  v_day_count      BIGINT;
  v_visit_id       UUID;
BEGIN
  -- Lock the college row to serialize daily capacity checks
  SELECT * INTO v_college
  FROM public.colleges
  WHERE id = p_college_id
  FOR UPDATE;

  IF v_college IS NULL OR v_college.status != 'active' THEN
    RETURN jsonb_build_object('error', 'College not found or inactive', 'status', 404);
  END IF;

  -- Count today's non-cancelled visits for this college+date
  SELECT COUNT(*) INTO v_day_count
  FROM public.college_visits
  WHERE college_id = p_college_id
    AND visit_date = p_visit_date
    AND status != 'cancelled';

  IF v_day_count >= v_college.daily_visit_capacity THEN
    RETURN jsonb_build_object('error', 'Visit capacity for this date is full.', 'status', 409);
  END IF;

  -- Insert visit
  INSERT INTO public.college_visits (
    student_id, college_id, visit_date, visit_time, status
  ) VALUES (
    p_student_id, p_college_id, p_visit_date, p_visit_time, 'pending'
  )
  RETURNING id INTO v_visit_id;

  -- Adjust credits atomically
  IF p_use_purchased THEN
    UPDATE public.student_profiles
    SET purchased_visits = GREATEST(purchased_visits - 1, 0)
    WHERE user_id = p_student_id;
  ELSE
    UPDATE public.student_profiles
    SET used_free_visits = COALESCE(used_free_visits, 0) + 1
    WHERE user_id = p_student_id;
  END IF;

  RETURN jsonb_build_object('visit_id', v_visit_id, 'status', 201);

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'error', 'You already have a visit request for this college on this date.',
      'status', 409
    );
END;
$$;


-- ============================================================
-- 3. ATOMIC CASCADE DELETE: remove college + all related data
--    in one transaction.
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_college_cascade(p_college_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot_ids UUID[];
BEGIN
  -- Collect slot IDs for this college
  SELECT ARRAY_AGG(id) INTO v_slot_ids
  FROM public.counselling_slots
  WHERE college_id = p_college_id;

  -- Delete bookings referencing these slots
  IF v_slot_ids IS NOT NULL AND array_length(v_slot_ids, 1) > 0 THEN
    DELETE FROM public.counselling_bookings WHERE slot_id = ANY(v_slot_ids);
  END IF;

  -- Delete bookings referencing this college directly
  DELETE FROM public.counselling_bookings WHERE context_college_id = p_college_id;

  -- Delete related data
  DELETE FROM public.saved_colleges    WHERE college_id = p_college_id;
  DELETE FROM public.college_visits    WHERE college_id = p_college_id;
  DELETE FROM public.counselling_slots WHERE college_id = p_college_id;
  DELETE FROM public.college_courses   WHERE college_id = p_college_id;

  -- Delete the college itself
  DELETE FROM public.colleges WHERE id = p_college_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
