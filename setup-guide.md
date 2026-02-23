# Main In Motion — Setup Guide

Step-by-step instructions to deploy the Main In Motion interactive construction map for Mooresville, IN.

## Prerequisites

- A web browser
- A free Supabase account (supabase.com)
- A free Netlify account (netlify.com) — or any static hosting

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account)
2. Click **"New Project"**
3. Name it something like `main-in-motion`
4. Choose a strong database password (save it somewhere safe)
5. Select the region closest to you (e.g., US East)
6. Click **"Create new project"** and wait for it to initialize

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. Copy the **Project URL** — it looks like `https://abcdefg.supabase.co`
3. Copy the **anon/public** key (the long string under "Project API keys")
4. Open `js/config.js` in a text editor
5. Replace `https://YOUR_PROJECT.supabase.co` with your Project URL
6. Replace `YOUR_ANON_KEY` with your anon key
7. Save the file

## Step 3: Set Up the Database

1. In Supabase, go to the **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `supabase/schema.sql` from this project folder
4. Copy the entire contents and paste into the SQL editor
5. Click **"Run"** — you should see "Success" with no errors
6. Click **"New query"** again
7. Open `supabase/seed.sql` from this project folder
8. Copy the entire contents and paste into the SQL editor
9. Click **"Run"** — this loads all the parking lots, businesses, construction phases, and map features

## Step 4: Create an Admin Account

1. In Supabase, go to **Authentication** (left sidebar) → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter an email and password for the admin account
4. Check **"Auto Confirm User"**
5. Click **"Create user"**
6. You can create additional admin accounts the same way

## Step 5: Deploy to Netlify

### Option A: Drag and Drop (Easiest)
1. Go to [app.netlify.com](https://app.netlify.com) and sign in
2. At the bottom of the Sites page, you'll see a drag-and-drop zone
3. Drag the entire `main-in-motion` project folder onto it
4. Netlify will deploy automatically and give you a URL like `https://random-name.netlify.app`

### Option B: Git Repository
1. Push the project to a GitHub/GitLab repository
2. In Netlify, click "Add new site" → "Import an existing project"
3. Connect your repository
4. Deploy settings: Leave defaults (publish directory is root `/`)
5. Click "Deploy"

## Step 6: Test Everything

1. Visit your Netlify URL — you should see the map centered on Mooresville
2. Check that parking lots appear as blue "P" markers
3. Check that construction zones and detour routes are visible
4. Click on a parking lot to see the popup with directions
5. Visit `yoursite.netlify.app/admin` to test the admin panel
6. Log in with the admin email/password you created in Step 4
7. Try editing a business status, adding a parking lot, etc.

## Step 7: Custom Domain (Optional)

1. In Netlify, go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow the DNS configuration instructions
4. Suggested: `maininmotion.mooresville.in.gov` or similar

## Troubleshooting

### Map shows but no data appears
- Check that `js/config.js` has the correct Supabase URL and anon key
- Verify the SQL schema and seed data ran successfully (check Supabase Table Editor)
- Open browser DevTools → Console to see any error messages

### Admin login doesn't work
- Make sure you created a user in Supabase Auth (not just the database)
- Check that "Auto Confirm User" was enabled when creating the user
- Verify the email and password are correct

### Changes in admin don't appear on public map
- Supabase Realtime is enabled by default on new projects
- If not working, go to Supabase → Database → Replication and enable realtime for all tables
- Users may need to refresh the page

## Updating Content

The admin panel at `/admin` lets you:
- **Add/edit/delete parking lots** — click on the map or use the Parking tab
- **Update business statuses** — quick dropdown in the Businesses tab
- **Manage construction phases** — activate/deactivate phases, which shows/hides their map features
- **Draw new map features** — use the drawing tools on the Map Editor to create zones, routes, barriers
- **Import GeoJSON** — upload files from geojson.io for complex routes
- **Edit the announcement banner** — update the message shown to all users
- **Update contact information** — phone, website, social links

All changes appear immediately on the public map (via Supabase Realtime).

## Architecture Notes

- **Frontend**: Static HTML/CSS/JS — no build step required
- **Backend**: Supabase (PostgreSQL + Auth + REST API + Realtime)
- **Map**: Leaflet.js with OpenStreetMap (free, no API key needed)
- **Routing**: OSRM (free walking directions)
- **Cost**: $0/month on free tiers
