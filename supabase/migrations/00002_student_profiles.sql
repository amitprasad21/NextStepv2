-- Migration 00002: student_profiles table
-- ON DELETE CASCADE from users. is_complete gates bookings.

CREATE TABLE public.student_profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name      VARCHAR(150) NOT NULL,
  city           VARCHAR(100) NOT NULL,
  state          VARCHAR(100) NOT NULL,
  marks_10th     DECIMAL(5,2) NOT NULL CHECK (marks_10th BETWEEN 0 AND 100),
  marks_12th     DECIMAL(5,2) CHECK (marks_12th BETWEEN 0 AND 100),
  appearing_12th BOOLEAN NOT NULL DEFAULT false,
  jee_rank       INTEGER,
  desired_course VARCHAR(100) NOT NULL,
  desired_branch VARCHAR(100),
  stream         TEXT NOT NULL CHECK (stream IN ('UG','PG')),
  is_complete    BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON public.student_profiles(user_id);
