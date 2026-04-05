-- Migration 00020: Fix admin RLS policy on payment_transactions
--
-- The original policy checked `admin_users.user_id = auth.uid()` which is
-- incorrect — admin_users.user_id references public.users.id, NOT auth.uid().
-- This replaces it with the correct pattern used everywhere else in the codebase.

-- Drop the broken policy
DROP POLICY IF EXISTS "Enable read for admins" ON public.payment_transactions;

-- Re-create with correct auth check
CREATE POLICY "Enable read for admins" ON public.payment_transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);
