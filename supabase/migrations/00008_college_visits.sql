-- Migration 00008: college_visits table

CREATE TABLE public.college_visits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES public.users(id),
  college_id          UUID NOT NULL REFERENCES public.colleges(id),
  visit_date          DATE NOT NULL,
  visit_time          TIME,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','completed','cancelled')),
  admin_notes         TEXT,
  cancellation_reason TEXT,
  confirmed_by        UUID REFERENCES public.admin_users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visits_student_id   ON public.college_visits(student_id);
CREATE INDEX idx_visits_college_date ON public.college_visits(college_id, visit_date);
CREATE INDEX idx_visits_status       ON public.college_visits(status);
