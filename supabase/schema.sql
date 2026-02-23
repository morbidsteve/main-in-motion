-- Main In Motion — Supabase Schema
-- Run this in Supabase SQL Editor first

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PARKING LOTS
-- ============================================
CREATE TABLE parking_lots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  capacity TEXT,
  type TEXT DEFAULT 'public',
  hours TEXT DEFAULT '24/7',
  notes TEXT,
  accessible BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CONSTRUCTION PHASES
-- ============================================
CREATE TABLE construction_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  estimated_end_date DATE,
  duration_weeks TEXT,
  status TEXT DEFAULT 'upcoming',
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MAP FEATURES
-- ============================================
CREATE TABLE map_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_id UUID REFERENCES construction_phases(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  direction TEXT,
  geometry_type TEXT NOT NULL,
  geometry_coords JSONB NOT NULL,
  style_color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- BUSINESSES
-- ============================================
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT,
  website TEXT,
  category TEXT,
  status TEXT DEFAULT 'open',
  access_note TEXT,
  nearest_parking_id UUID REFERENCES parking_lots(id),
  hours TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- APP SETTINGS
-- ============================================
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE parking_lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read parking" ON parking_lots FOR SELECT USING (true);
CREATE POLICY "Admin write parking" ON parking_lots FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE construction_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read phases" ON construction_phases FOR SELECT USING (true);
CREATE POLICY "Admin write phases" ON construction_phases FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE map_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read features" ON map_features FOR SELECT USING (true);
CREATE POLICY "Admin write features" ON map_features FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "Admin write businesses" ON businesses FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON app_settings FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_parking_active ON parking_lots(is_active);
CREATE INDEX idx_businesses_active ON businesses(is_active);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_map_features_phase ON map_features(phase_id);
CREATE INDEX idx_map_features_type ON map_features(feature_type);
CREATE INDEX idx_map_features_active ON map_features(is_active);
CREATE INDEX idx_phases_status ON construction_phases(status);
CREATE INDEX idx_phases_sort ON construction_phases(sort_order);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parking_lots_updated_at
  BEFORE UPDATE ON parking_lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
