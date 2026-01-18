-- =============================================
-- SPT Instan - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- TABLE 1: profiles (user profiles)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    quota_balance INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup (trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, quota_balance)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- TABLE 2: tax_reports (saved form data)
-- =============================================
CREATE TABLE IF NOT EXISTS tax_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nama_wajib_pajak TEXT NOT NULL,
    npwp TEXT NOT NULL,
    tahun_pajak TEXT NOT NULL,
    form_data JSONB NOT NULL,
    is_download_unlocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own reports
CREATE POLICY "Users can read own reports" ON tax_reports
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON tax_reports
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON tax_reports
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON tax_reports
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- =============================================
-- TABLE 3: payments (payment history)
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    package_type TEXT NOT NULL, -- '1_quota' or '5_quota'
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, success, failed, expired
    doku_payment_url TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can read their own payments
CREATE POLICY "Users can read own payments" ON payments
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Service role can insert/update (via Edge Functions)
-- No direct insert/update policy for authenticated users

-- =============================================
-- TABLE 4: quota_transactions (audit log)
-- =============================================
CREATE TABLE IF NOT EXISTS quota_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL, -- 'purchase' or 'usage'
    amount INTEGER NOT NULL, -- positive for purchase, negative for usage
    report_id UUID REFERENCES tax_reports(id),
    payment_id UUID REFERENCES payments(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quota_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions" ON quota_transactions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTION: increment_quota
-- =============================================
CREATE OR REPLACE FUNCTION increment_quota(user_id_input UUID, amount_input INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET quota_balance = quota_balance + amount_input,
        updated_at = NOW()
    WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_tax_reports_user_id ON tax_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_number);
CREATE INDEX IF NOT EXISTS idx_quota_transactions_user_id ON quota_transactions(user_id);

-- =============================================
-- Grant permissions for Edge Functions
-- =============================================
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
