-- Migration 00009: saved_colleges table
-- UNIQUE (student_id, college_id) prevents duplicate saves.

CREATE TABLE public.saved_colleges (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id),
  college_id UUID NOT NULL REFERENCES public.colleges(id),
  saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, college_id)
);

CREATE INDEX idx_saved_student_id ON public.saved_colleges(student_id);
CREATE INDEX idx_saved_college_id ON public.saved_colleges(college_id);
