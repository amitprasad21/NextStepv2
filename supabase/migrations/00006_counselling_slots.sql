-- Migration 00006: counselling_slots table
-- UNIQUE (slot_date, slot_time) prevents duplicate slots.

CREATE TABLE public.counselling_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date    DATE NOT NULL,
  slot_time    TIME NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 1,
  booked_count INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_by   UUID NOT NULL REFERENCES public.admin_users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slot_date, slot_time)
);

CREATE INDEX idx_slots_date ON public.counselling_slots(slot_date);
