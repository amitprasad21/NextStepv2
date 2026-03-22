-- Migration 00005: college_courses table
-- Source for sync_fee_range trigger. Has updated_at (was missing in v3.0).

CREATE TABLE public.college_courses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id     UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  course_name    VARCHAR(100) NOT NULL,
  branch         VARCHAR(100),
  stream         TEXT NOT NULL CHECK (stream IN ('UG','PG')),
  duration_years INTEGER,
  annual_fee     INTEGER,
  eligibility    TEXT,
  exams_accepted TEXT[] NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_college_id ON public.college_courses(college_id);
CREATE INDEX idx_courses_stream     ON public.college_courses(stream);
CREATE INDEX idx_courses_exams_gin  ON public.college_courses USING GIN(exams_accepted);
