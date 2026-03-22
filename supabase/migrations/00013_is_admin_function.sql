-- Migration 00013: is_admin() helper function
-- MUST be created BEFORE any RLS policy that calls it.
-- Uses SECURITY DEFINER to bypass RLS for the check itself.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
