-- Main In Motion — Seed Data
-- Run this AFTER schema.sql

-- ============================================
-- CONSTRUCTION PHASES
-- ============================================
INSERT INTO construction_phases (id, name, description, start_date, estimated_end_date, duration_weeks, status, sort_order, notes) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Stage 1a', 'West Main St — Monroe to Carter St (west end sub-phase)', '2026-02-25', '2026-05-06', '8-10', 'active', 1, 'Phase 1a began February 25, 2026. Main St closed Monroe to Carter.'),
  ('a1000000-0000-0000-0000-000000000002', 'Stage 1', 'West Main St — Monroe St to Concord Dr', '2026-02-25', '2026-05-06', '8-10', 'active', 2, 'Full Stage 1 extends from Monroe to Concord Dr.'),
  ('a1000000-0000-0000-0000-000000000003', 'Stage 2', 'Central Main St — Concord Dr to Clay St', '2026-05-01', '2026-08-01', '12-14', 'upcoming', 3, 'Paver install may cause minor disruptions or limited access. Traffic on Main St should be maintained. Parallel parking access could be disrupted.'),
  ('a1000000-0000-0000-0000-000000000004', 'Stage 2a', 'Central Main St — Concord Dr / Indiana St intersection', '2026-05-01', '2026-08-01', NULL, 'upcoming', 4, 'Sub-phase of Stage 2 focusing on the main intersection.'),
  ('a1000000-0000-0000-0000-000000000005', 'Stage 3', 'East Main St — Indiana St to Maple Ln', '2026-08-01', '2026-12-01', '14-16', 'upcoming', 5, 'Paver install may cause minor disruptions. Public parking lots will remain open during construction.'),
  ('a1000000-0000-0000-0000-000000000006', 'Stage 3a', 'East Main St — Clay St / Maple Ln area (east end sub-phase)', '2026-08-01', '2026-12-01', NULL, 'upcoming', 6, 'Sub-phase of Stage 3 focusing on the east end.');

-- ============================================
-- PARKING LOTS
-- ============================================
INSERT INTO parking_lots (id, name, address, lat, lng, capacity, type, hours, notes, accessible, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'West Concord Lot (North)', 'North of Main St, between Concord Dr & Indiana St', 39.6132, -86.3745, '~30 spaces', 'public', '24/7', 'Closest to central businesses. Remains open during all construction phases.', true, true),
  ('b1000000-0000-0000-0000-000000000002', 'West Concord Lot (South)', 'South of Main St, between Jefferson & Concord Dr', 39.6124, -86.3757, '~20 spaces', 'public', '24/7', 'Near Town Court. Access via Harrison St during Stage 1.', true, true),
  ('b1000000-0000-0000-0000-000000000003', 'Harrison St Lot', 'Harrison St between Concord Dr & Indiana St', 39.6118, -86.3745, '~25 spaces', 'public', '24/7', 'Near Government Center. Good access from Harrison St.', true, true),
  ('b1000000-0000-0000-0000-000000000004', 'East Indiana Lot', 'SE of Main St between Indiana & Clay St', 39.6124, -86.3722, '~20 spaces', 'public', '24/7', 'Near east-side businesses and restaurants.', true, true),
  ('b1000000-0000-0000-0000-000000000005', 'East Main Lot', 'SW of Clay St & Main St', 39.6124, -86.3710, '~15 spaces', 'public', '24/7', 'Visible from Main St near Clay St intersection.', true, true),
  ('b1000000-0000-0000-0000-000000000006', 'BMO / Concord Lot', 'Near 33 W Main St / Concord Dr', 39.6126, -86.3752, '~15 spaces', 'business-shared', '24/7', 'Near BMO Bank. Shared lot, please be courteous.', true, true);

-- ============================================
-- MAP FEATURES — STAGE 1a
-- ============================================

-- Construction Zone polygon
INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'construction_zone', 'Stage 1a Construction Zone', 'Main St right-of-way from west of Monroe to Carter St', 'Polygon', '[[39.6132,-86.3798],[39.6132,-86.3775],[39.6127,-86.3775],[39.6127,-86.3798]]', '#DC2626', true);

-- Road closure
INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'road_closure', 'Stage 1a Main St Closure', 'Main St closed from S West St to approximately Concord Dr', 'LineString', '[[39.6130,-86.3808],[39.6130,-86.3793],[39.6129,-86.3778],[39.6128,-86.3764],[39.6128,-86.3751]]', '#DC2626', true);

-- Detour north
INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'detour_route', 'Stage 1a North Detour', 'Via Washington St (north of Main)', 'both', 'LineString', '[[39.6130,-86.3808],[39.6138,-86.3808],[39.6138,-86.3793],[39.6136,-86.3764],[39.6130,-86.3751]]', '#F59E0B', true);

-- Detour south
INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'detour_route', 'Stage 1a South Detour', 'Via Harrison St (south of Main)', 'both', 'LineString', '[[39.6130,-86.3793],[39.6122,-86.3793],[39.6120,-86.3764],[39.6120,-86.3751],[39.6128,-86.3751]]', '#F59E0B', true);

-- Local traffic only
INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'local_traffic_only', 'Monroe St Local Traffic (North)', 'Monroe St north of Main — local traffic only', 'LineString', '[[39.6130,-86.3793],[39.6134,-86.3793]]', '#9CA3AF', true),
  ('a1000000-0000-0000-0000-000000000001', 'local_traffic_only', 'Monroe St Local Traffic (South)', 'Monroe St south of Main — local traffic only', 'LineString', '[[39.6130,-86.3793],[39.6126,-86.3793]]', '#9CA3AF', true);

-- Partial barriers
INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'partial_barrier', 'Monroe & Washington Barrier', 'Partial barrier at Monroe & Washington', 'Point', '[39.6138,-86.3793]', '#DC2626', true),
  ('a1000000-0000-0000-0000-000000000001', 'partial_barrier', 'Monroe & Harrison Barrier', 'Partial barrier at Monroe & Harrison', 'Point', '[39.6122,-86.3793]', '#DC2626', true);

-- Road blocks
INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'road_block', 'Main & Monroe West Block', 'Road block at Main & Monroe western approach', 'Point', '[39.6130,-86.3795]', '#DC2626', true),
  ('a1000000-0000-0000-0000-000000000001', 'road_block', 'Stage 1a East Block', 'Road block at east end of Stage 1a construction zone', 'Point', '[39.6129,-86.3770]', '#DC2626', true);

-- ============================================
-- MAP FEATURES — STAGE 1
-- ============================================

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'construction_zone', 'Stage 1 Construction Zone', 'Main St from Monroe to just past Concord Dr', 'Polygon', '[[39.6132,-86.3798],[39.6132,-86.3748],[39.6127,-86.3748],[39.6127,-86.3798]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'road_closure', 'Stage 1 Main St Closure', 'Main St closed Monroe to Indiana St', 'LineString', '[[39.6130,-86.3793],[39.6129,-86.3778],[39.6128,-86.3764],[39.6128,-86.3751],[39.6128,-86.3738]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'detour_route', 'Stage 1 North Detour', 'Monroe to Washington east to Indiana south', 'both', 'LineString', '[[39.6130,-86.3793],[39.6138,-86.3793],[39.6138,-86.3764],[39.6136,-86.3751],[39.6136,-86.3738],[39.6128,-86.3738]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'detour_route', 'Stage 1 South Detour', 'Monroe to Harrison east to Indiana north', 'both', 'LineString', '[[39.6130,-86.3793],[39.6122,-86.3793],[39.6120,-86.3764],[39.6120,-86.3751],[39.6120,-86.3738],[39.6128,-86.3738]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'road_block', 'Jefferson & Main Block', 'Road block at Jefferson St & Main', 'Point', '[39.6128,-86.3764]', '#DC2626', false),
  ('a1000000-0000-0000-0000-000000000002', 'road_block', 'Carter & Main Block', 'Road block at Carter St & Main', 'Point', '[39.6129,-86.3778]', '#DC2626', false);

-- ============================================
-- MAP FEATURES — STAGE 2
-- ============================================

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'construction_zone', 'Stage 2 Construction Zone', 'Main St from Concord Dr to Clay St', 'Polygon', '[[39.6132,-86.3755],[39.6132,-86.3705],[39.6125,-86.3705],[39.6125,-86.3755]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'road_closure', 'Stage 2 Main St Closure', 'Main St closed Concord Dr to Clay St', 'LineString', '[[39.6128,-86.3751],[39.6128,-86.3738],[39.6126,-86.3708]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'detour_route', 'Stage 2 North Detour', 'Jefferson to Washington east to Clay south', 'both', 'LineString', '[[39.6128,-86.3764],[39.6136,-86.3764],[39.6136,-86.3751],[39.6136,-86.3738],[39.6135,-86.3708],[39.6126,-86.3708]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'detour_route', 'Stage 2 South Detour', 'Jefferson to Harrison east to Clay north', 'both', 'LineString', '[[39.6128,-86.3764],[39.6120,-86.3764],[39.6120,-86.3751],[39.6120,-86.3738],[39.6118,-86.3708],[39.6126,-86.3708]]', '#F59E0B', false);

-- ============================================
-- MAP FEATURES — STAGE 2a
-- ============================================

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'construction_zone', 'Stage 2a Construction Zone', 'Concord Dr / Indiana St intersection area', 'Polygon', '[[39.6132,-86.3748],[39.6132,-86.3732],[39.6124,-86.3732],[39.6124,-86.3748]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'detour_route', 'Stage 2a North Detour', 'Same as Stage 2 detour', 'both', 'LineString', '[[39.6128,-86.3764],[39.6136,-86.3764],[39.6136,-86.3751],[39.6136,-86.3738],[39.6135,-86.3708],[39.6126,-86.3708]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'detour_route', 'Stage 2a South Detour', 'Same as Stage 2 detour', 'both', 'LineString', '[[39.6128,-86.3764],[39.6120,-86.3764],[39.6120,-86.3751],[39.6120,-86.3738],[39.6118,-86.3708],[39.6126,-86.3708]]', '#F59E0B', false);

-- ============================================
-- MAP FEATURES — STAGE 3
-- ============================================

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'construction_zone', 'Stage 3 Construction Zone', 'Main St from east of Indiana to Maple Ln', 'Polygon', '[[39.6131,-86.3735],[39.6131,-86.3685],[39.6124,-86.3685],[39.6124,-86.3735]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'road_closure', 'Stage 3 Main St Closure', 'Main St closed Indiana St to Maple Ln', 'LineString', '[[39.6128,-86.3738],[39.6126,-86.3708],[39.6125,-86.3688]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'detour_route', 'Stage 3 North Detour', 'Indiana to Washington east to Franklin south', 'both', 'LineString', '[[39.6128,-86.3738],[39.6136,-86.3738],[39.6135,-86.3708],[39.6134,-86.3688],[39.6133,-86.3660],[39.6125,-86.3660]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'detour_route', 'Stage 3 South Detour', 'Indiana to Harrison east to Franklin north', 'both', 'LineString', '[[39.6128,-86.3738],[39.6120,-86.3738],[39.6118,-86.3708],[39.6117,-86.3678],[39.6116,-86.3660],[39.6125,-86.3660]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'road_block', 'Clay & Main Block', 'Road block at Clay St & Main', 'Point', '[39.6126,-86.3708]', '#DC2626', false);

-- ============================================
-- MAP FEATURES — STAGE 3a
-- ============================================

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'construction_zone', 'Stage 3a Construction Zone', 'Main St from Clay St to Maple Ln / Madison St', 'Polygon', '[[39.6130,-86.3712],[39.6130,-86.3675],[39.6123,-86.3675],[39.6123,-86.3712]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'detour_route', 'Stage 3a North Detour', 'Clay to Washington east to Franklin south', 'both', 'LineString', '[[39.6126,-86.3708],[39.6135,-86.3708],[39.6134,-86.3688],[39.6133,-86.3660],[39.6125,-86.3660]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'detour_route', 'Stage 3a South Detour', 'Clay to Harrison east to Franklin north', 'both', 'LineString', '[[39.6126,-86.3708],[39.6118,-86.3708],[39.6117,-86.3678],[39.6116,-86.3660],[39.6125,-86.3660]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'partial_barrier', 'Maple & Washington Barrier', 'Partial barrier at Maple Ln & Washington', 'Point', '[39.6134,-86.3688]', '#DC2626', false);

-- ============================================
-- BUSINESSES — West Main (Stage 1/1a area)
-- ============================================
INSERT INTO businesses (name, address, lat, lng, category, status, access_note, is_active) VALUES
  ('PDS Connect', '101 W Main St', 39.6129, -86.3790, 'Services', 'open', 'Access from Jefferson St or Concord Dr. Main St closed Monroe to Carter.', true),
  ('Sign for It', '68 W Main St', 39.6129, -86.3772, 'Services', 'open', 'Access from Jefferson St or Concord Dr. Main St closed Monroe to Carter.', true),
  ('Arnold Appraisal Services', '64 W Main St', 39.6129, -86.3770, 'Services', 'open', 'Access from Jefferson St or Concord Dr. Main St closed Monroe to Carter.', true),
  ('Tri County Sports Shop', '64 W Main St', 39.6130, -86.3770, 'Retail', 'open', 'Access from Jefferson St or Concord Dr. Main St closed Monroe to Carter.', true),
  ('Indiana Painting', '46 W Main St', 39.6129, -86.3768, 'Services', 'open', 'Access from Jefferson St or Concord Dr. Main St closed Monroe to Carter.', true),
  ('BMO Bank', '33 W Main St', 39.6129, -86.3754, 'Services', 'open', 'Access from Concord Dr. Parking available at BMO/Concord Lot.', true);

-- ============================================
-- BUSINESSES — Central Downtown (Stage 2 area) — Dining
-- ============================================
INSERT INTO businesses (name, address, lat, lng, category, status, access_note, is_active) VALUES
  ('Brew Link Brewpub', '11 E Main St', 39.6128, -86.3732, 'Dining', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Eremos Coffee Company', '15 W Main St', 39.6129, -86.3745, 'Dining', 'open', 'Open during construction. Access from Indiana St or Concord Dr.', true),
  ('The Parlor PS', '6 W Main St', 39.6129, -86.3740, 'Dining', 'open', 'Open during construction. Access from Indiana St.', true);

-- ============================================
-- BUSINESSES — Central Downtown — Retail
-- ============================================
INSERT INTO businesses (name, address, lat, lng, category, status, access_note, is_active) VALUES
  ('AnneMarie Footwear Apparel', '20 E Main St', 39.6127, -86.3725, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Bud & Bloom Florist', '22 E Main St', 39.6127, -86.3723, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Buffalo Gal Antiques', '23 E Main St', 39.6128, -86.3722, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Constable''s Antiques', '25 S Indiana St', 39.6119, -86.3738, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Gray''s Hollow', '16 S Indiana St', 39.6126, -86.3738, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Just Us Jewelry', '24 E Main St', 39.6127, -86.3721, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Nosh Dessert Parlour', '20 S Indiana St', 39.6122, -86.3738, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Smith''s Sweet Shoppe', '2 W Main St', 39.6128, -86.3739, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Yellow Moon Antique Mall', '10 W Main St', 39.6129, -86.3742, 'Retail', 'open', 'Open during construction. Access from Indiana St or Concord Dr.', true);

-- ============================================
-- BUSINESSES — Central Downtown — Services
-- ============================================
INSERT INTO businesses (name, address, lat, lng, category, status, access_note, is_active) VALUES
  ('Alexander Insurance Agency', '14 N Indiana St', 39.6132, -86.3738, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Allen and Son Barbershop', '16 N Indiana St', 39.6133, -86.3738, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Bennett Realty', '18 S Indiana St', 39.6124, -86.3738, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Churches in Mission', '27 S Indiana St', 39.6118, -86.3738, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Citizens Bank', '33 N Indiana St', 39.6137, -86.3738, 'Services', 'open', 'Open during construction. Access from Indiana St or Washington St.', true),
  ('Courtland Title & Escrow', '33 E Main St', 39.6128, -86.3714, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Fairway Home Mortgage', '1 W Main St', 39.6128, -86.3739, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Five East Event Center', '5 E Main St', 39.6128, -86.3735, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Five Star Mortgage Solutions', '19 E Main St', 39.6128, -86.3726, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Freedom Investment and Insurance', '23 W Main St', 39.6129, -86.3748, 'Services', 'open', 'Open during construction. Access from Concord Dr.', true),
  ('G.V. McGowan Family Dentistry', '21 E Main St', 39.6128, -86.3724, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Harris and Currens', '9 W Main St', 39.6128, -86.3741, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Kendrick Foundation', '11 W Main St', 39.6128, -86.3743, 'Services', 'open', 'Open during construction. Access from Indiana St or Concord Dr.', true),
  ('Law Office Of Jennifer Durham', '29 E Main St', 39.6128, -86.3717, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Lloyd Insurance', '31 W Main St', 39.6129, -86.3752, 'Services', 'open', 'Open during construction. Access from Concord Dr.', true),
  ('McGauley CPA', '19 S Indiana St', 39.6123, -86.3738, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Peaceful Spirit Yoga', '18 E Main St', 39.6127, -86.3727, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Pendill Wealth Management', '12 W Main St', 39.6128, -86.3744, 'Services', 'open', 'Open during construction. Access from Indiana St or Concord Dr.', true),
  ('Pete Majeski - State Farm Insurance', '17 S Indiana St', 39.6125, -86.3738, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Restoration Massage and Reflexology', '25 W Main St', 39.6129, -86.3749, 'Services', 'open', 'Open during construction. Access from Concord Dr.', true),
  ('Salon Twenty Nine', '21 W Main St', 39.6129, -86.3747, 'Services', 'open', 'Open during construction. Access from Concord Dr.', true),
  ('True Self Concepts', '16 E Main St', 39.6127, -86.3728, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Unreal Beauty Collective', '15 E Main St', 39.6128, -86.3729, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Voodoo Lounge Tattoo Parlor', '12 E Main St', 39.6127, -86.3731, 'Services', 'open', 'Open during construction. Access from Indiana St.', true);

-- ============================================
-- BUSINESSES — East Main (Stage 3 area)
-- ============================================
INSERT INTO businesses (name, address, lat, lng, category, status, access_note, is_active) VALUES
  ('Color Works', '67 E Main St', 39.6127, -86.3705, 'Services', 'open', 'Open during construction. Access from Clay St.', true),
  ('Circle K', '143 E Main St', 39.6126, -86.3685, 'Services', 'open', 'Open during construction. Access from Maple Ln.', true);

-- ============================================
-- APP SETTINGS
-- ============================================
INSERT INTO app_settings (key, value) VALUES
  ('active_phase', '"stage-1a"'),
  ('announcement', '{"text": "Stage 1a construction has begun! Main St is closed from Monroe to Carter. All businesses are OPEN — use Harrison St or Washington St to detour.", "type": "warning", "active": true}'),
  ('contact_info', '{"phone": "(317) 831-7700", "website": "https://www.mooresville.in.gov/main-in-motion/", "facebook": "Town of Mooresville on Facebook"}');
