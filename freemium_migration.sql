-- 1. Add Freemium Odometers to Student Profiles
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS used_free_counselling INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS used_free_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchased_counselling INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchased_visits INTEGER DEFAULT 0;

-- 2. Create Platform Settings Table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  counselling_price_inr INTEGER NOT NULL DEFAULT 199,
  visit_price_inr INTEGER NOT NULL DEFAULT 499,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default settings row if it doesn't exist
INSERT INTO public.platform_settings (counselling_price_inr, visit_price_inr)
SELECT 199, 499
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

-- Enable RLS for settings so frontend can read prices
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Enable update for admins" ON public.platform_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
