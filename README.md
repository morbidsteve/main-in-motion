# Main In Motion — Mooresville, IN

Interactive construction map for the **Main In Motion** streetscape project — an $8M initiative transforming 8 blocks of Main Street (SR 42) in downtown Mooresville, Indiana, from Monroe Street to Maple Lane at the railroad tracks.

Helps visitors and residents find parking, see detour routes, and confirm businesses are open during construction.

---

## Quick Start (Windows)

Open **PowerShell** and paste:

```powershell
irm https://raw.githubusercontent.com/morbidsteve/main-in-motion/main/run.ps1 -OutFile $env:TEMP\run.ps1; powershell -ExecutionPolicy Bypass -File $env:TEMP\run.ps1
```

This downloads and runs the setup script. It handles everything — checks for Docker and Git, clones the repo, builds the image, and starts the server. Prompts for admin if needed.

## Quick Start (Any OS with Docker)

```bash
git clone https://github.com/morbidsteve/main-in-motion.git
cd main-in-motion
docker build -t main-in-motion .
docker run -d -p 8080:8080 --name main-in-motion main-in-motion
```

Open `http://localhost:8080` — or use your machine's LAN IP to access from other devices.

## Quick Start (No Docker)

Requires Python 3:

```bash
git clone https://github.com/morbidsteve/main-in-motion.git
cd main-in-motion
python3 -m http.server 8080 --bind 0.0.0.0
```

---

## What It Does

### Public Map (`/`)
- **Parking lots** — Blue "P" markers with capacity, hours, and accessibility info
- **Walking directions** — Tap a parking lot to get OSRM-powered walking routes
- **Native maps** — "Open in Maps" deep-links to Apple Maps (iOS) or Google Maps (Android)
- **Construction zones** — Semi-transparent red overlay polygons
- **Road closures** — Dashed red lines showing closed road segments
- **Detour routes** — Orange lines with directional chevron arrows
- **Barriers** — Road block and partial barrier markers at key intersections
- **GPS blue dot** — Live location with pulsing animation and accuracy circle
- **Business directory** — 44 real businesses with status (open/limited/closed), category, phone, and access notes
- **Layer controls** — Toggle parking, construction, detours, and businesses on/off
- **Phase viewer** — See all 6 construction stages with timelines, preview upcoming phases on the map
- **Announcement banner** — Configurable alert banner from admin settings
- **Mobile bottom sheet** — Drag-to-expand panel with tabs for Parking, Businesses, and Info
- **Desktop sidebar** — Fixed sidebar on large screens with the same content
- **PWA** — Installable with offline support via service worker

### Admin Panel (`/admin.html`)
- **Supabase Auth** login (email/password)
- **Visual map editor** — Leaflet.draw tools to create polygons, polylines, and markers directly on the map
- **Drag to reposition** — Move parking lots and businesses by dragging their markers
- **Parking CRUD** — Add, edit, delete, toggle active status
- **Business CRUD** — Inline status dropdowns, bulk status changes, category filters
- **Phase management** — Activate/deactivate phases (cascades to associated map features)
- **Map feature management** — Edit type, phase, color, direction, and active status
- **GeoJSON import** — Upload `.geojson` files to bulk-create map features
- **Settings** — Edit announcement banner text/type/active state, contact info
- **Realtime** — All changes appear immediately on the public map via Supabase Realtime

---

## Seed Data Included

The SQL seed files pre-populate the database with all real data so the app works immediately:

| Data | Count | Source |
|---|---|---|
| Construction phases | 6 | Banning Engineering diagrams (Jan 2026) |
| Map features | 28 | Official phasing diagrams — zones, closures, detours, barriers |
| Parking lots | 6 | Marked on official construction diagrams |
| Businesses | 44 | Official "We're Open During Construction" signs |
| App settings | 3 | Announcement, contact info, active phase |

### Construction Phases
| Phase | Area | Status |
|---|---|---|
| Stage 1a | Monroe to Carter St | Active (started Feb 25, 2026) |
| Stage 1 | Monroe to Concord Dr | Active |
| Stage 2 | Concord Dr to Clay St | Upcoming — Spring 2026 |
| Stage 2a | Concord/Indiana intersection | Upcoming — Spring 2026 |
| Stage 3 | Indiana St to Maple Ln | Upcoming — Late Summer 2026 |
| Stage 3a | Clay St to Maple Ln | Upcoming — Late Summer 2026 |

---

## Supabase Setup

The app reads data from Supabase. Without it, the map loads but shows no markers or overlays.

### 1. Create a project
Go to [supabase.com](https://supabase.com), create a free project.

### 2. Get credentials
**Settings → API** — copy the Project URL and anon key.

Edit `js/config.js`:
```javascript
export const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 3. Run the schema
**SQL Editor → New query** — paste the contents of `supabase/schema.sql` and click Run.

This creates 5 tables with Row Level Security (public read, authenticated write):
- `parking_lots`
- `construction_phases`
- `map_features`
- `businesses`
- `app_settings`

### 4. Load seed data
**SQL Editor → New query** — paste the contents of `supabase/seed.sql` and click Run.

### 5. Create an admin user
**Authentication → Users → Add user** — enter an email and password, check "Auto Confirm User".

### 6. Enable Realtime (if not automatic)
**Database → Replication** — enable realtime for all 5 tables.

---

## Architecture

```
Browser ──GET──→ Static files (Netlify / Docker / any HTTP server)
       ──REST──→ Supabase (PostgreSQL + Auth + Realtime)
       ──Tiles─→ OpenStreetMap (free, no API key)
       ──Route─→ OSRM (free walking directions)
```

- **Frontend**: Vanilla JavaScript ES modules, Leaflet.js, Tailwind CSS (CDN)
- **Backend**: Supabase free tier (500MB database, unlimited API requests)
- **Hosting**: Netlify free tier, or Docker, or any static file server
- **Cost**: $0/month

### Dependencies (all free, loaded via CDN)

| Library | Purpose |
|---|---|
| [Leaflet.js](https://leafletjs.com/) | Interactive map |
| [OpenStreetMap](https://www.openstreetmap.org/) | Map tiles |
| [Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/) + OSRM | Walking directions |
| [Leaflet.draw](https://leaflet.github.io/Leaflet.draw/) | Admin drawing tools |
| [Leaflet.PolylineDecorator](https://github.com/bbecquet/Leaflet.PolylineDecorator) | Directional arrows on detour routes |
| [Supabase JS v2](https://supabase.com/docs/reference/javascript/) | Database + Auth + Realtime |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |

---

## Project Structure

```
main-in-motion/
├── index.html                 Public map app
├── admin.html                 Admin panel
├── css/
│   ├── app.css                Public styles
│   └── admin.css              Admin styles
├── js/
│   ├── config.js              Supabase credentials + map config
│   ├── supabase-client.js     Data fetching + realtime
│   ├── app.js                 Public entry point
│   ├── map.js                 Leaflet initialization
│   ├── geolocation.js         GPS blue dot
│   ├── directions.js          Walking directions (OSRM)
│   ├── utils.js               Distance, platform detect, helpers
│   ├── layers/
│   │   ├── parking.js         Blue P markers + popups
│   │   ├── construction.js    Zone polygons + road closures
│   │   ├── detours.js         Detour lines with arrows
│   │   └── businesses.js      Business dots + popups
│   ├── ui/
│   │   ├── bottom-sheet.js    Mobile drag sheet
│   │   ├── sidebar.js         Desktop sidebar
│   │   ├── layer-toggle.js    Layer checkboxes
│   │   └── announcement.js    Top banner
│   └── admin/
│       ├── auth.js            Supabase auth
│       └── admin-app.js       Full admin CRUD + map editor
├── assets/                    SVG icons
├── sw.js                      Service worker (offline)
├── manifest.json              PWA manifest
├── Dockerfile                 Docker deployment
├── run.ps1                    Windows setup script
├── netlify.toml               Netlify config
├── supabase/
│   ├── schema.sql             Database schema + RLS
│   └── seed.sql               All seed data
└── setup-guide.md             Detailed setup instructions
```

---

## Deploying to Netlify

1. Push this repo to GitHub (or use the existing repo)
2. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git
3. Select the repository, leave defaults (publish directory: root)
4. Deploy — get a URL like `https://your-site.netlify.app`

Or drag the project folder directly onto Netlify's deploy zone.

---

## Docker Commands

```bash
# Build and run
docker build -t main-in-motion .
docker run -d -p 8080:8080 --name main-in-motion main-in-motion

# Stop / Start / Remove
docker stop main-in-motion
docker start main-in-motion
docker rm -f main-in-motion

# View logs
docker logs main-in-motion
```

---

## Map Configuration

- **Center**: Main St & Indiana St — 39.61278, -86.37640
- **Default zoom**: 17
- **Tiles**: OpenStreetMap

### Branding Colors

| Element | Color |
|---|---|
| Primary (nav/header) | `#1B3A5C` (navy) |
| Accent (CTAs) | `#E87722` (orange) |
| Parking markers | `#2563EB` (blue) |
| Business open | `#16A34A` (green) |
| Business limited | `#F59E0B` (amber) |
| Business closed | `#DC2626` (red) |
| Construction zones | `#DC2626` at 15% opacity |
| Detour routes | `#F59E0B` (orange) |
| Road closures | `#DC2626` (red) |

---

## License

Built for the Town of Mooresville, Indiana. Mooresville Redevelopment Commission.
