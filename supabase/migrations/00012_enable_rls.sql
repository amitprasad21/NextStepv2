-- Migration 00012: Enable RLS on all 10 tables
-- MUST run BEFORE any policy creation.

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_courses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselling_slots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselling_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_visits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_colleges     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
