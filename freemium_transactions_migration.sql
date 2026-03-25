CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  amount_inr INTEGER NOT NULL,
  item_type TEXT NOT NULL, -- 'counselling' or 'visit'
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Students can view their own transactions
CREATE POLICY "Enable read for own transactions" ON public.payment_transactions 
FOR SELECT USING (
  student_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Admin can view all
CREATE POLICY "Enable read for admins" ON public.payment_transactions 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
