-- Migration 00017: Enhanced fields for colleges, student profiles, and bookings

-- ============================================================
-- 1. COLLEGES: Add detailed info fields
-- ============================================================
ALTER TABLE public.colleges
  ADD COLUMN IF NOT EXISTS established_year  INTEGER,
  ADD COLUMN IF NOT EXISTS website           TEXT,
  ADD COLUMN IF NOT EXISTS accreditation     TEXT,
  ADD COLUMN IF NOT EXISTS ranking           TEXT,
  ADD COLUMN IF NOT EXISTS campus_size       TEXT,
  ADD COLUMN IF NOT EXISTS placement_rate    DECIMAL(5,2) CHECK (placement_rate BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS avg_package       DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS highest_package   DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS facilities        TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hostel_available  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS scholarship       BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS college_type      TEXT DEFAULT 'private' CHECK (college_type IN ('government','private','deemed','autonomous'));

-- ============================================================
-- 2. STUDENT PROFILES: Add phone and extra academic fields
-- ============================================================
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS phone            VARCHAR(15),
  ADD COLUMN IF NOT EXISTS date_of_birth    DATE,
  ADD COLUMN IF NOT EXISTS gender           TEXT CHECK (gender IN ('male','female','other')),
  ADD COLUMN IF NOT EXISTS parent_name      VARCHAR(150),
  ADD COLUMN IF NOT EXISTS parent_phone     VARCHAR(15),
  ADD COLUMN IF NOT EXISTS address          TEXT,
  ADD COLUMN IF NOT EXISTS pincode          VARCHAR(10),
  ADD COLUMN IF NOT EXISTS board_10th       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS board_12th       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mht_cet_score    DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS neet_score       DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS other_exam_name  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS other_exam_score DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS budget_min       INTEGER,
  ADD COLUMN IF NOT EXISTS budget_max       INTEGER;

-- ============================================================
-- 3. BOOKINGS: Add meeting link for confirmed bookings
-- ============================================================
ALTER TABLE public.counselling_bookings
  ADD COLUMN IF NOT EXISTS meeting_link TEXT;
