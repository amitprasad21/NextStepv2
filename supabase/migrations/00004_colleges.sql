-- Migration 00004: colleges table
-- fee_min/fee_max auto-synced by sync_fee_range trigger.
-- fee_max >= fee_min CHECK constraint included.

CREATE TABLE public.colleges (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(255) NOT NULL,
  city                 VARCHAR(100) NOT NULL,
  state                VARCHAR(100) NOT NULL,
  description          TEXT,
  fee_min              INTEGER,
  fee_max              INTEGER,
  image_paths          TEXT[] NOT NULL DEFAULT '{}',
  daily_visit_capacity INTEGER NOT NULL DEFAULT 5 CHECK (daily_visit_capacity BETWEEN 5 AND 10),
  status               TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active','inactive')),
  is_featured          BOOLEAN NOT NULL DEFAULT false,
  is_deleted           BOOLEAN NOT NULL DEFAULT false,
  created_by           UUID NOT NULL REFERENCES public.admin_users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (fee_max IS NULL OR fee_min IS NULL OR fee_max >= fee_min)
);

-- Composite index for most common public query
CREATE INDEX idx_colleges_status_deleted ON public.colleges(status, is_deleted);
CREATE INDEX idx_colleges_city_state     ON public.colleges(city, state);
CREATE INDEX idx_colleges_featured       ON public.colleges(is_featured);
CREATE INDEX idx_colleges_fee            ON public.colleges(fee_min, fee_max);
