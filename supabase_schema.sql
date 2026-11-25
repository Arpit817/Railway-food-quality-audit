-- ==============================================================================
-- Indian Railways Food Quality & Traceability System
-- Supabase Cloud Schema & Real-Time Setup
-- ==============================================================================
-- Run this script in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. Create COMPLAINTS Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY,
    "referenceNo" TEXT NOT NULL,
    token TEXT,
    "batchId" TEXT,
    "vendorId" TEXT,
    "kitchenId" TEXT,
    rating NUMERIC DEFAULT 1,
    category TEXT,
    comment TEXT,
    severity TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'new',
    pnr TEXT,
    seat TEXT,
    phone TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    "actionLogs" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index for instant lookup on reference number and tokens
CREATE INDEX IF NOT EXISTS idx_complaints_reference ON public.complaints ("referenceNo");
CREATE INDEX IF NOT EXISTS idx_complaints_token ON public.complaints (token);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints (status);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON public.complaints ("createdAt" DESC);

-- 2. Create BATCHES Table (Catering Licensee Production Records)
CREATE TABLE IF NOT EXISTS public.batches (
    id TEXT PRIMARY KEY,
    "trainNumber" TEXT,
    "itemType" TEXT,
    "kitchenId" TEXT,
    "vendorId" TEXT,
    "producedAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    "expiryAt" TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    "createdAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_batches_train ON public.batches ("trainNumber");

-- 3. Create QR_CODES Table (Tamper-Evident Packaging Tokens)
CREATE TABLE IF NOT EXISTS public.qr_codes (
    token TEXT PRIMARY KEY,
    "batchId" TEXT,
    status TEXT DEFAULT 'active',
    "scanCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_qrcodes_batch ON public.qr_codes ("batchId");

-- ==============================================================================
-- 4. Enable Row Level Security (RLS) & Public Access Policies
-- ==============================================================================
-- Grant schema and table access to API roles (anon and authenticated)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Complaints policies
DROP POLICY IF EXISTS "Public can read complaints" ON public.complaints;
CREATE POLICY "Public can read complaints" ON public.complaints FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert complaints" ON public.complaints;
CREATE POLICY "Public can insert complaints" ON public.complaints FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update complaints" ON public.complaints;
CREATE POLICY "Public can update complaints" ON public.complaints FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete complaints" ON public.complaints;
CREATE POLICY "Public can delete complaints" ON public.complaints FOR DELETE USING (true);

-- Batches policies
DROP POLICY IF EXISTS "Public can read batches" ON public.batches;
CREATE POLICY "Public can read batches" ON public.batches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert batches" ON public.batches;
CREATE POLICY "Public can insert batches" ON public.batches FOR INSERT WITH CHECK (true);

-- QR Codes policies
DROP POLICY IF EXISTS "Public can read qr_codes" ON public.qr_codes;
CREATE POLICY "Public can read qr_codes" ON public.qr_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert qr_codes" ON public.qr_codes;
CREATE POLICY "Public can insert qr_codes" ON public.qr_codes FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 5. Enable Realtime Publications (Safely adds tables without duplicate error)
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'complaints'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'batches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.batches;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'qr_codes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_codes;
  END IF;
END $$;

-- ==============================================================================
-- 6. FEEDBACK Table (Passenger Meal Ratings → Vendor Scorecard)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.feedback (
    id TEXT PRIMARY KEY,
    token TEXT,
    "batchId" TEXT,
    "vendorId" TEXT,
    "kitchenId" TEXT,
    "trainNumber" TEXT,
    "overallRating" NUMERIC,
    "foodQualityRating" NUMERIC,
    "quantityRating" NUMERIC,
    "packagingRating" NUMERIC,
    "temperatureRating" NUMERIC,
    "positiveComment" TEXT,
    "improvementComment" TEXT,
    "wouldOrderAgain" TEXT,
    "passengerName" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_feedback_vendor ON public.feedback ("vendorId");
CREATE INDEX IF NOT EXISTS idx_feedback_batch ON public.feedback ("batchId");
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback ("createdAt" DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read feedback" ON public.feedback;
CREATE POLICY "Public can read feedback" ON public.feedback FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert feedback" ON public.feedback;
CREATE POLICY "Public can insert feedback" ON public.feedback FOR INSERT WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'feedback'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;
  END IF;
END $$;

-- ==============================================================================
-- 7. STAFF_ACCOUNTS Table (Cross-Device Authentication)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.staff_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'inspector',
    zone TEXT,
    "badgeId" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff_accounts (email);

ALTER TABLE public.staff_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read staff_accounts" ON public.staff_accounts;
CREATE POLICY "Public can read staff_accounts" ON public.staff_accounts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert staff_accounts" ON public.staff_accounts;
CREATE POLICY "Public can insert staff_accounts" ON public.staff_accounts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update staff_accounts" ON public.staff_accounts;
CREATE POLICY "Public can update staff_accounts" ON public.staff_accounts FOR UPDATE USING (true);

-- ==============================================================================
-- 8. Seed Initial Staff Accounts (run once — safe to re-run)
-- ==============================================================================
INSERT INTO public.staff_accounts (id, name, email, password, role, zone, "badgeId") VALUES
  ('user-insp-01', 'Inspector Ramesh Sharma', 'inspector.nr@railfood.gov.in', 'Railway@2026', 'inspector', 'Northern Zone', 'NR-FSO-884'),
  ('user-vendor-01', 'Express Caterers (Pantry Licensee)', 'vendor.express@railfood.gov.in', 'Vendor@2026', 'vendor', 'Northern Zone', 'RR-CAT-2024-001'),
  ('user-admin-01', 'Director Neha Gupta', 'admin.safety@railfood.gov.in', 'AdminHQ@2026', 'admin', 'All India HQ', 'HQ-DIR-019')
ON CONFLICT (id) DO NOTHING;

