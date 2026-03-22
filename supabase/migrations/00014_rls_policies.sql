-- Migration 00014: All RLS policies
-- Depends on: RLS enabled (00012) + is_admin() function (00013)

-- users: self-read + admin read
CREATE POLICY users_read ON public.users
  FOR SELECT USING (auth_id = auth.uid() OR is_admin());

-- student_profiles: own data + admin read-only
CREATE POLICY profiles_own ON public.student_profiles
  USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY profiles_admin ON public.student_profiles
  FOR SELECT USING (is_admin());

-- admin_users: admin only
CREATE POLICY admin_only ON public.admin_users
  USING (is_admin());

-- colleges: public read (active + not deleted) + admin full access
CREATE POLICY colleges_public ON public.colleges
  FOR SELECT USING (status = 'active' AND is_deleted = false);

CREATE POLICY colleges_admin ON public.colleges
  USING (is_admin());

-- college_courses: public read (via active college) + admin full access
CREATE POLICY courses_public ON public.college_courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.colleges
      WHERE id = college_id AND status = 'active' AND is_deleted = false
    )
  );

CREATE POLICY courses_admin ON public.college_courses
  USING (is_admin());

-- counselling_slots: available for students, all for admin
CREATE POLICY slots_read ON public.counselling_slots
  FOR SELECT USING (is_available = true OR is_admin());

CREATE POLICY slots_admin ON public.counselling_slots
  USING (is_admin());

-- counselling_bookings: own read + own insert + admin full access
CREATE POLICY bookings_own ON public.counselling_bookings
  FOR SELECT USING (
    student_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY bookings_insert ON public.counselling_bookings
  FOR INSERT WITH CHECK (
    student_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY bookings_admin ON public.counselling_bookings
  USING (is_admin());

-- college_visits: own read + own insert + admin full access
CREATE POLICY visits_own ON public.college_visits
  FOR SELECT USING (
    student_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY visits_insert ON public.college_visits
  FOR INSERT WITH CHECK (
    student_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY visits_admin ON public.college_visits
  USING (is_admin());

-- saved_colleges: own data only
CREATE POLICY saved_own ON public.saved_colleges
  USING (student_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- notifications: own read + admin read
CREATE POLICY notif_own ON public.notifications
  FOR SELECT USING (
    student_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY notif_admin ON public.notifications
  USING (is_admin());
