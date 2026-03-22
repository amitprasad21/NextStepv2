-- Migration 00007: counselling_bookings table
-- TEXT CHECK for booking_type (consistent across all docs).
-- Partial UNIQUE INDEX prevents duplicate active bookings.

CREATE TABLE public.counselling_bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES public.users(id),
  slot_id             UUID NOT NULL REFERENCES public.counselling_slots(id),
  context_college_id  UUID REFERENCES public.colleges(id),
  booking_type        TEXT NOT NULL DEFAULT 'free_call' CHECK (booking_type IN ('free_call')),
  preferred_date      DATE NOT NULL,
  preferred_time      TIME NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','completed','cancelled')),
  admin_notes         TEXT,
  cancellation_reason TEXT,
  confirmed_by        UUID REFERENCES public.admin_users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_student_id ON public.counselling_bookings(student_id);
CREATE INDEX idx_bookings_slot_id    ON public.counselling_bookings(slot_id);
CREATE INDEX idx_bookings_status     ON public.counselling_bookings(status);

-- Partial UNIQUE prevents duplicate active bookings (app-layer + DB)
CREATE UNIQUE INDEX idx_bookings_no_duplicate
  ON public.counselling_bookings (student_id, slot_id) WHERE status != 'cancelled';
