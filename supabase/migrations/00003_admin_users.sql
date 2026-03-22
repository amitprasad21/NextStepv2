-- Migration 00003: admin_users table
-- No password_hash. Auth via Supabase Auth only.
-- Provisioned manually via DB script — no self-registration.

CREATE TABLE public.admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE NOT NULL REFERENCES public.users(id),
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON public.admin_users(email);
