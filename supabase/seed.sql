-- Main In Motion — Seed Data
-- Run this AFTER schema.sql
-- Coordinates verified against OpenStreetMap Nominatim geocoding (Feb 2026)

-- ============================================
-- CONSTRUCTION PHASES
-- ============================================
INSERT INTO construction_phases (id, name, description, start_date, estimated_end_date, duration_weeks, status, sort_order, notes) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Stage 1a', 'West Main St — Monroe to Carter St (west end sub-phase)', '2026-02-25', '2026-05-06', '8-10', 'active', 1, 'Phase 1a began February 25, 2026. Main St closed Monroe to Carter.'),
  ('a1000000-0000-0000-0000-000000000002', 'Stage 1', 'West Main St — Monroe St to Concord Dr', '2026-02-25', '2026-05-06', '8-10', 'active', 2, 'Full Stage 1 extends from Monroe to Concord Dr.'),
  ('a1000000-0000-0000-0000-000000000003', 'Stage 2', 'Central Main St — Concord Dr to Clay St', '2026-05-01', '2026-08-01', '12-14', 'upcoming', 3, 'Paver install may cause minor disruptions or limited access. Traffic on Main St should be maintained. Parallel parking access could be disrupted.'),
  ('a1000000-0000-0000-0000-000000000004', 'Stage 2a', 'Central Main St — Concord Dr / Indiana St intersection', '2026-05-01', '2026-08-01', NULL, 'upcoming', 4, 'Sub-phase of Stage 2 focusing on the main intersection.'),
  ('a1000000-0000-0000-0000-000000000005', 'Stage 3', 'East Main St — Indiana St to Maple Ln', '2026-08-01', '2026-12-01', '14-16', 'upcoming', 5, 'Paver install may cause minor disruptions. Public parking lots will remain open during construction.'),
  ('a1000000-0000-0000-0000-000000000006', 'Stage 3a', 'East Main St — Clay St to Franklin St (east end sub-phase)', '2026-08-01', '2026-12-01', NULL, 'upcoming', 6, 'Sub-phase of Stage 3 focusing on the east end.');

-- ============================================
-- PARKING LOTS
-- Positions verified from phasing diagrams (P markers) and OSM geocoding
-- ============================================
INSERT INTO parking_lots (id, name, address, lat, lng, capacity, type, hours, notes, accessible, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'North Lot (Concord/Indiana)', 'North of Main St, between Concord Dr & Indiana St', 39.6133, -86.3756, '~30 spaces', 'public', '24/7', 'Closest to central businesses. Remains open during all construction phases.', true, true),
  ('b1000000-0000-0000-0000-000000000002', 'South Lot (Jefferson/Concord)', 'South of Main St, near Jefferson & Concord Dr', 39.6121, -86.3762, '~20 spaces', 'public', '24/7', 'Near Town Court. Access via Harrison St during Stage 1.', true, true),
  ('b1000000-0000-0000-0000-000000000003', 'Harrison St Lot', 'Harrison St between Concord Dr & Indiana St', 39.6119, -86.3751, '~25 spaces', 'public', '24/7', 'Near Government Center. Good access from Harrison St.', true, true),
  ('b1000000-0000-0000-0000-000000000004', 'East Indiana Lot', 'SE of Main St between Indiana & Clay St', 39.6122, -86.3742, '~20 spaces', 'public', '24/7', 'Near east-side businesses and restaurants.', true, true),
  ('b1000000-0000-0000-0000-000000000005', 'East Main Lot', 'Near Clay St & Main St', 39.6125, -86.3732, '~15 spaces', 'public', '24/7', 'Visible from Main St near Clay St intersection.', true, true),
  ('b1000000-0000-0000-0000-000000000006', 'BMO / Concord Lot', 'Near 33 W Main St / Concord Dr', 39.6127, -86.3760, '~15 spaces', 'business-shared', '24/7', 'Near BMO Bank. Shared lot, please be courteous.', true, true);

-- ============================================
-- MAP FEATURES — STAGE 1a (Monroe to Carter)
-- Cross-street refs: Monroe=-86.3778, Carter=-86.3771
-- ============================================

-- Construction Zone polygon
INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'construction_zone', 'Stage 1a Construction Zone', 'Main St right-of-way from Monroe to Carter St', 'Polygon', '[[39.6130,-86.3780],[39.6130,-86.3770],[39.6126,-86.3770],[39.6126,-86.3780]]', '#DC2626', true);

-- Road closure (extends to S West St approach)
INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'road_closure', 'Stage 1a Main St Closure', 'Main St closed from S West St approach to Carter St', 'LineString', '[[39.6128,-86.3800],[39.6128,-86.3778],[39.6128,-86.3771]]', '#DC2626', true);

-- Detour north (via Washington St)
INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'detour_route', 'Stage 1a North Detour', 'Via Washington St (north of Main)', 'both', 'LineString', '[[39.6128,-86.3800],[39.6139,-86.3800],[39.6139,-86.3778],[39.6139,-86.3766],[39.6128,-86.3766]]', '#F59E0B', true);

-- Detour south (via Harrison St)
INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'detour_route', 'Stage 1a South Detour', 'Via Harrison St (south of Main)', 'both', 'LineString', '[[39.6128,-86.3800],[39.6117,-86.3800],[39.6117,-86.3778],[39.6117,-86.3766],[39.6128,-86.3766]]', '#F59E0B', true);

-- Local traffic only (Monroe St segments)
INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'local_traffic_only', 'Monroe St Local Traffic (North)', 'Monroe St north of Main — local traffic only', 'LineString', '[[39.6128,-86.3778],[39.6139,-86.3778]]', '#9CA3AF', true),
  ('a1000000-0000-0000-0000-000000000001', 'local_traffic_only', 'Monroe St Local Traffic (South)', 'Monroe St south of Main — local traffic only', 'LineString', '[[39.6128,-86.3778],[39.6117,-86.3778]]', '#9CA3AF', true);

-- Partial barriers
INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'partial_barrier', 'Monroe & Washington Barrier', 'Partial barrier at Monroe & Washington', 'Point', '[39.6139,-86.3778]', '#DC2626', true),
  ('a1000000-0000-0000-0000-000000000001', 'partial_barrier', 'Monroe & Harrison Barrier', 'Partial barrier at Monroe & Harrison', 'Point', '[39.6117,-86.3778]', '#DC2626', true);

-- Road blocks
INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'road_block', 'Main & Monroe West Block', 'Road block on Main St west of Monroe', 'Point', '[39.6128,-86.3782]', '#DC2626', true),
  ('a1000000-0000-0000-0000-000000000001', 'road_block', 'Main & Carter East Block', 'Road block at Main & Carter eastern end', 'Point', '[39.6128,-86.3770]', '#DC2626', true);

-- ============================================
-- MAP FEATURES — STAGE 1 (Monroe to Concord Dr)
-- Cross-street refs: Monroe=-86.3778, Concord=-86.3760, Indiana=-86.3751
-- ============================================

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'construction_zone', 'Stage 1 Construction Zone', 'Main St from Monroe to Concord Dr', 'Polygon', '[[39.6130,-86.3780],[39.6130,-86.3758],[39.6126,-86.3758],[39.6126,-86.3780]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'road_closure', 'Stage 1 Main St Closure', 'Main St closed Monroe to Concord Dr', 'LineString', '[[39.6128,-86.3780],[39.6128,-86.3771],[39.6128,-86.3766],[39.6128,-86.3758]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'detour_route', 'Stage 1 North Detour', 'Monroe to Washington east to Indiana south', 'both', 'LineString', '[[39.6128,-86.3780],[39.6139,-86.3780],[39.6139,-86.3766],[39.6139,-86.3751],[39.6128,-86.3751]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'detour_route', 'Stage 1 South Detour', 'Monroe to Harrison east to Indiana north', 'both', 'LineString', '[[39.6128,-86.3780],[39.6117,-86.3780],[39.6117,-86.3766],[39.6117,-86.3751],[39.6128,-86.3751]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'road_block', 'Monroe & Main Block', 'Road block at Monroe St & Main', 'Point', '[39.6128,-86.3780]', '#DC2626', false),
  ('a1000000-0000-0000-0000-000000000002', 'road_block', 'Concord & Main Block', 'Road block at Concord Dr & Main', 'Point', '[39.6128,-86.3758]', '#DC2626', false);

-- ============================================
-- MAP FEATURES — STAGE 2 (Concord Dr to Clay St)
-- Cross-street refs: Jefferson=-86.3766, Concord=-86.3760, Clay=-86.3732
-- ============================================

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'construction_zone', 'Stage 2 Construction Zone', 'Main St from Concord Dr to Clay St', 'Polygon', '[[39.6130,-86.3760],[39.6130,-86.3730],[39.6126,-86.3730],[39.6126,-86.3760]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'road_closure', 'Stage 2 Main St Closure', 'Main St closed Concord Dr to Clay St', 'LineString', '[[39.6128,-86.3760],[39.6128,-86.3751],[39.6128,-86.3732]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'detour_route', 'Stage 2 North Detour', 'Jefferson to Washington east to Clay south', 'both', 'LineString', '[[39.6128,-86.3766],[39.6139,-86.3766],[39.6139,-86.3751],[39.6139,-86.3732],[39.6128,-86.3732]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'detour_route', 'Stage 2 South Detour', 'Jefferson to Harrison east to Clay north', 'both', 'LineString', '[[39.6128,-86.3766],[39.6117,-86.3766],[39.6117,-86.3751],[39.6117,-86.3732],[39.6128,-86.3732]]', '#F59E0B', false);

-- ============================================
-- MAP FEATURES — STAGE 2a (Indiana St intersection)
-- ============================================

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'construction_zone', 'Stage 2a Construction Zone', 'Indiana St intersection — north/south through Main', 'Polygon', '[[39.6134,-86.3754],[39.6134,-86.3748],[39.6122,-86.3748],[39.6122,-86.3754]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'road_closure', 'Stage 2a Indiana St Closure', 'Indiana St closed through Main St intersection', 'LineString', '[[39.6134,-86.3751],[39.6128,-86.3751],[39.6122,-86.3751]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'detour_route', 'Stage 2a North Detour', 'Same as Stage 2 — via Washington St', 'both', 'LineString', '[[39.6128,-86.3766],[39.6139,-86.3766],[39.6139,-86.3751],[39.6139,-86.3732],[39.6128,-86.3732]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'detour_route', 'Stage 2a South Detour', 'Same as Stage 2 — via Harrison St', 'both', 'LineString', '[[39.6128,-86.3766],[39.6117,-86.3766],[39.6117,-86.3751],[39.6117,-86.3732],[39.6128,-86.3732]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'road_block', 'Indiana & Washington Block', 'Road block at Indiana St & Washington', 'Point', '[39.6139,-86.3751]', '#DC2626', false),
  ('a1000000-0000-0000-0000-000000000004', 'road_block', 'Indiana & Harrison Block', 'Road block at Indiana St & Harrison', 'Point', '[39.6117,-86.3751]', '#DC2626', false);

-- ============================================
-- MAP FEATURES — STAGE 3 (Indiana St to Maple Ln)
-- Cross-street refs: Indiana=-86.3751, Clay=-86.3732, Maple=-86.3710, Franklin=-86.3693
-- ============================================

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'construction_zone', 'Stage 3 Construction Zone', 'Main St from east of Indiana to Maple Ln', 'Polygon', '[[39.6130,-86.3749],[39.6130,-86.3710],[39.6126,-86.3710],[39.6126,-86.3749]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'road_closure', 'Stage 3 Main St Closure', 'Main St closed Indiana St to Maple Ln', 'LineString', '[[39.6128,-86.3749],[39.6128,-86.3732],[39.6128,-86.3710]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'detour_route', 'Stage 3 North Detour', 'Indiana to Washington east to Franklin south', 'both', 'LineString', '[[39.6128,-86.3751],[39.6139,-86.3751],[39.6139,-86.3732],[39.6139,-86.3710],[39.6139,-86.3693],[39.6128,-86.3693]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'detour_route', 'Stage 3 South Detour', 'Indiana to Harrison east to Franklin north', 'both', 'LineString', '[[39.6128,-86.3751],[39.6117,-86.3751],[39.6117,-86.3732],[39.6117,-86.3710],[39.6117,-86.3693],[39.6128,-86.3693]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'road_block', 'Indiana & Main Block', 'Road block at Indiana St & Main', 'Point', '[39.6128,-86.3749]', '#DC2626', false),
  ('a1000000-0000-0000-0000-000000000005', 'road_block', 'Maple & Main Block', 'Road block at Maple Ln & Main', 'Point', '[39.6128,-86.3710]', '#DC2626', false);

-- ============================================
-- MAP FEATURES — STAGE 3a (Clay St to Franklin St)
-- ============================================

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'construction_zone', 'Stage 3a Construction Zone', 'Main St from Clay St to Madison / Franklin area', 'Polygon', '[[39.6130,-86.3732],[39.6130,-86.3698],[39.6126,-86.3698],[39.6126,-86.3732]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'road_closure', 'Stage 3a Main St Closure', 'Main St closed Clay to Madison/Franklin', 'LineString', '[[39.6128,-86.3732],[39.6128,-86.3710],[39.6128,-86.3698]]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'detour_route', 'Stage 3a North Detour', 'Clay to Washington east to Franklin south', 'both', 'LineString', '[[39.6128,-86.3732],[39.6139,-86.3732],[39.6139,-86.3710],[39.6139,-86.3693],[39.6128,-86.3693]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, direction, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'detour_route', 'Stage 3a South Detour', 'Clay to Harrison east to Franklin north', 'both', 'LineString', '[[39.6128,-86.3732],[39.6117,-86.3732],[39.6117,-86.3710],[39.6117,-86.3693],[39.6128,-86.3693]]', '#F59E0B', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'partial_barrier', 'Maple & Washington Barrier', 'Partial barrier at Maple Ln & Washington', 'Point', '[39.6139,-86.3710]', '#DC2626', false),
  ('a1000000-0000-0000-0000-000000000006', 'partial_barrier', 'Maple & Harrison Barrier', 'Partial barrier at Maple Ln & Harrison', 'Point', '[39.6117,-86.3710]', '#DC2626', false);

INSERT INTO map_features (phase_id, feature_type, name, description, geometry_type, geometry_coords, style_color, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'road_block', 'Clay & Main Block', 'Road block at Clay St & Main', 'Point', '[39.6128,-86.3732]', '#DC2626', false),
  ('a1000000-0000-0000-0000-000000000006', 'road_block', 'Franklin & Main Block', 'Road block at Franklin St & Main', 'Point', '[39.6128,-86.3693]', '#DC2626', false);

-- ============================================
-- BUSINESSES — West Main (Stage 1/1a area)
-- Coordinates: OSM Nominatim geocoded. Even=north side (~39.6129), Odd=south side (~39.6127)
-- ============================================
INSERT INTO businesses (name, address, lat, lng, category, status, access_note, is_active) VALUES
  ('PDS Connect', '101 W Main St', 39.6127, -86.3776, 'Services', 'open', 'Access from Jefferson St or Concord Dr. Main St closed Monroe to Carter.', true),
  ('Sign for It', '68 W Main St', 39.6129, -86.3769, 'Services', 'open', 'Access from Jefferson St or Concord Dr. Main St closed Monroe to Carter.', true),
  ('Arnold Appraisal Services', '64 W Main St', 39.6129, -86.3769, 'Services', 'open', 'Access from Jefferson St or Concord Dr. Main St closed Monroe to Carter.', true),
  ('Tri County Sports Shop', '64 W Main St', 39.6130, -86.3769, 'Retail', 'open', 'Access from Jefferson St or Concord Dr. Main St closed Monroe to Carter.', true),
  ('Indiana Painting', '46 W Main St', 39.6129, -86.3766, 'Services', 'open', 'Access from Jefferson St or Concord Dr. Main St closed Monroe to Carter.', true),
  ('BMO Bank', '33 W Main St', 39.6127, -86.3760, 'Services', 'open', 'Access from Concord Dr. Parking available at BMO/Concord Lot.', true);

-- ============================================
-- BUSINESSES — Central Downtown (Stage 2 area) — Dining
-- ============================================
INSERT INTO businesses (name, address, lat, lng, category, status, access_note, is_active) VALUES
  ('Brew Link Brewpub', '11 E Main St', 39.6127, -86.3746, 'Dining', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Eremos Coffee Company', '15 W Main St', 39.6127, -86.3753, 'Dining', 'open', 'Open during construction. Access from Indiana St or Concord Dr.', true),
  ('The Parlor PS', '6 W Main St', 39.6129, -86.3751, 'Dining', 'open', 'Open during construction. Access from Indiana St.', true);

-- ============================================
-- BUSINESSES — Central Downtown — Retail
-- ============================================
INSERT INTO businesses (name, address, lat, lng, category, status, access_note, is_active) VALUES
  ('AnneMarie Footwear Apparel', '20 E Main St', 39.6129, -86.3743, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Bud & Bloom Florist', '22 E Main St', 39.6129, -86.3743, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Buffalo Gal Antiques', '23 E Main St', 39.6127, -86.3742, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Constable''s Antiques', '25 S Indiana St', 39.6121, -86.3748, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Gray''s Hollow', '16 S Indiana St', 39.6121, -86.3750, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Just Us Jewelry', '24 E Main St', 39.6129, -86.3742, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Nosh Dessert Parlour', '20 S Indiana St', 39.6120, -86.3749, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Smith''s Sweet Shoppe', '2 W Main St', 39.6129, -86.3751, 'Retail', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Yellow Moon Antique Mall', '10 W Main St', 39.6129, -86.3754, 'Retail', 'open', 'Open during construction. Access from Indiana St or Concord Dr.', true);

-- ============================================
-- BUSINESSES — Central Downtown — Services
-- ============================================
INSERT INTO businesses (name, address, lat, lng, category, status, access_note, is_active) VALUES
  ('Alexander Insurance Agency', '14 N Indiana St', 39.6130, -86.3750, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Allen and Son Barbershop', '16 N Indiana St', 39.6131, -86.3750, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Bennett Realty', '18 S Indiana St', 39.6121, -86.3750, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Churches in Mission', '27 S Indiana St', 39.6119, -86.3748, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Citizens Bank', '33 N Indiana St', 39.6132, -86.3750, 'Services', 'open', 'Open during construction. Access from Indiana St or Washington St.', true),
  ('Courtland Title & Escrow', '33 E Main St', 39.6127, -86.3740, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Fairway Home Mortgage', '1 W Main St', 39.6127, -86.3751, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Five East Event Center', '5 E Main St', 39.6127, -86.3747, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Five Star Mortgage Solutions', '19 E Main St', 39.6127, -86.3744, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Freedom Investment and Insurance', '23 W Main St', 39.6127, -86.3757, 'Services', 'open', 'Open during construction. Access from Concord Dr.', true),
  ('G.V. McGowan Family Dentistry', '21 E Main St', 39.6127, -86.3743, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Harris and Currens', '9 W Main St', 39.6127, -86.3753, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Kendrick Foundation', '11 W Main St', 39.6127, -86.3754, 'Services', 'open', 'Open during construction. Access from Indiana St or Concord Dr.', true),
  ('Law Office Of Jennifer Durham', '29 E Main St', 39.6127, -86.3741, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Lloyd Insurance', '31 W Main St', 39.6127, -86.3759, 'Services', 'open', 'Open during construction. Access from Concord Dr.', true),
  ('McGauley CPA', '19 S Indiana St', 39.6121, -86.3750, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Peaceful Spirit Yoga', '18 E Main St', 39.6129, -86.3744, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Pendill Wealth Management', '12 W Main St', 39.6129, -86.3755, 'Services', 'open', 'Open during construction. Access from Indiana St or Concord Dr.', true),
  ('Pete Majeski - State Farm Insurance', '17 S Indiana St', 39.6121, -86.3751, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Restoration Massage and Reflexology', '25 W Main St', 39.6127, -86.3757, 'Services', 'open', 'Open during construction. Access from Concord Dr.', true),
  ('Salon Twenty Nine', '21 W Main St', 39.6127, -86.3756, 'Services', 'open', 'Open during construction. Access from Concord Dr.', true),
  ('True Self Concepts', '16 E Main St', 39.6129, -86.3745, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Unreal Beauty Collective', '15 E Main St', 39.6127, -86.3746, 'Services', 'open', 'Open during construction. Access from Indiana St.', true),
  ('Voodoo Lounge Tattoo Parlor', '12 E Main St', 39.6129, -86.3746, 'Services', 'open', 'Open during construction. Access from Indiana St.', true);

-- ============================================
-- BUSINESSES — East Main (Stage 3 area)
-- ============================================
INSERT INTO businesses (name, address, lat, lng, category, status, access_note, is_active) VALUES
  ('Color Works', '67 E Main St', 39.6127, -86.3732, 'Services', 'open', 'Open during construction. Access from Clay St.', true),
  ('Circle K', '143 E Main St', 39.6127, -86.3712, 'Services', 'open', 'Open during construction. Access from Maple Ln.', true);

-- ============================================
-- APP SETTINGS
-- ============================================
INSERT INTO app_settings (key, value) VALUES
  ('active_phase', '"stage-1a"'),
  ('announcement', '{"text": "Stage 1a construction has begun! Main St is closed from Monroe to Carter. All businesses are OPEN — use Harrison St or Washington St to detour.", "type": "warning", "active": true}'),
  ('contact_info', '{"phone": "(317) 831-7700", "website": "https://www.mooresville.in.gov/main-in-motion/", "facebook": "Town of Mooresville on Facebook"}');
