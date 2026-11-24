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
-- (Allows anonymous passengers & inspectors to read/write without complex auth setup)
-- ==============================================================================
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
-- 5. Enable Realtime Publications (Instant WebSocket updates across all devices)
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.batches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_codes;
