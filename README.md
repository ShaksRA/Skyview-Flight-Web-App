# ✈ SkyWay — Flight Web App

A production-grade flight booking platform built with Next.js 14, Supabase, and Zustand. Features real-time seat selection, full booking management, reschedule/cancel flows, and PWA support.

---

## 🚀 Live Demo

**Production URL:** [https://skyway-flight-app.vercel.app](https://skyway-flight-app-lyart.vercel.app/)

**Test Credentials:**
| Email | Password |
|-------|----------|
| demo@skyway.com | password123 |

---

## ✅ Submission Checklist

- [x] Public GitHub repository with descriptive commit history
- [x] `.env.example` with all Supabase environment variables
- [x] Supabase migration SQL files in `/supabase/migrations`
- [x] Seed script with 10 flights, full seat maps, and test user
- [x] README with setup steps, Supabase config, Zustand store explanation
- [x] Deployed on Vercel
- [x] Lighthouse PWA screenshot included

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend & API | Next.js 14 (App Router) |
| Database & Auth | Supabase (PostgreSQL + Auth + Realtime) |
| State Management | Zustand with persist middleware |
| Styling | Tailwind CSS + inline styles |
| PWA | next-pwa |
| Language | TypeScript (strict) |

---

## 📋 Features

- **Flight Search** — Search by origin, destination, date, passengers
- **Interactive Seat Map** — Visual cabin grid (First / Business / Economy) with Supabase Realtime live updates
- **Booking Flow** — 4-step wizard: Flight → Seat → Passenger Details → Confirmation with PNR
- **My Bookings** — View all bookings with status badges (Confirmed / Rescheduled / Cancelled)
- **Reschedule** — Pick alternative flight on same route; fee charged if new flight costs more
- **Cancel** — Confirmation dialog; 2-hour departure window enforced at DB trigger level
- **Auth** — Sign up / Sign in with initials avatar; Demo user login
- **PWA** — Installable, offline-capable; My Bookings readable offline via cached data

---

## 🗄 Database Schema

```
flights ─────────────────────────────────────────┐
  id, flight_no, origin, destination,             │
  departs_at, arrives_at, aircraft_type,          │
  status, base_price                              │
                                                  │
seats ───────────────────────────────────────────┤
  id, flight_id (→ flights), seat_number,        │
  class, is_available, extra_fee                 │
                                                  │
bookings ────────────────────────────────────────┤
  id, user_id (→ auth.users), flight_id,        │
  seat_id, status, booked_at,                   │
  total_price, pnr_code                         │
                                                  │
passengers ──────────────────────────────────────┤
  id, booking_id (→ bookings),                  │
  full_name, passport_no,                       │
  nationality, dob                              │
                                                  │
reschedules ─────────────────────────────────────┘
  id, booking_id, old_flight_id,
  new_flight_id, requested_at, fee_charged
```

### RLS Policies
| Table | Policy |
|-------|--------|
| flights | Public SELECT; service role INSERT/UPDATE |
| seats | Public SELECT; service role INSERT/UPDATE |
| bookings | Users SELECT/INSERT/UPDATE own rows only |
| passengers | Users SELECT/INSERT own booking's passengers only |
| reschedules | Users SELECT/INSERT own booking's reschedules only |

### Key RPC Functions
- **`reserve_seat()`** — `FOR UPDATE SKIP LOCKED` prevents double-booking race conditions
- **`cancel_booking()`** — Validates 2-hour window, frees seat, updates status atomically
- **`reschedule_booking()`** — Frees old seat, reserves new, records history, charges fee difference
- **DB Trigger** — `enforce_cancellation_window` fires on `bookings` UPDATE as second layer of protection

---

## 🏪 Zustand Store Architecture

### `useFlightStore` — Booking Flow State

```
State
├── searchQuery         { origin, destination, date, passengers }
│                       → PERSISTED to localStorage
├── searchResults       Flight[]
│                       → NOT persisted (re-fetched on load)
├── selectedFlight      Flight | null
│                       → PERSISTED
├── selectedClass       'economy' | 'business' | 'first'
│                       → PERSISTED
├── selectedSeat        Seat | null
│                       → PERSISTED
├── optimisticSeatId    string | null
│                       → NOT persisted (UI-only, reset on reload)
├── currentStep         1 | 2 | 3 | 4
│                       → PERSISTED (resume after tab close)
└── passengerData       PassengerFormData[]
                        → PERSISTED but passport_no EXCLUDED via partialize

Key Design Decisions
• partialize strips passport numbers before writing to localStorage
• optimisticSeatId enables instant seat highlight before Supabase write confirms
• resetBookingFlow() wipes all transient state — called on cancel and logout
```

### `useUserStore` — Auth & Cached Bookings

```
State
├── session             Supabase Session | null
├── user                Supabase User | null
├── cachedBookings      Booking[]  (for offline PWA reads)
└── isLoadingBookings   boolean

Persistence
• Only session.access_token, refresh_token, expires_at are persisted
• Full user profile and bookings are NOT stored in localStorage
• Bookings re-fetched on every load for freshness
• resetUser() called on logout — clears all state and localStorage entry
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- npm
- Supabase account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/skyway-flight-app
cd skyway-flight-app
npm install
```

### 2. Create Supabase Project

1. Go to https://supabase.com → New Project
2. Name: `skyway-flight-app`
3. Choose a region close to you
4. Copy **Project URL** and **anon key** from Settings → API

### 3. Environment Variables

```bash
cp .env.example .env.local
# Fill in your Supabase values
```

### 4. Run Database Migrations

In Supabase Dashboard → SQL Editor, run each file in order:

```
supabase/migrations/001_initial_schema.sql   → Creates tables + RLS
supabase/migrations/002_rpc_functions.sql    → Creates RPC functions + trigger
supabase/migrations/003_seed_data.sql        → Seeds 10 flights + seat maps
```

Verify with:
```sql
select count(*) as total_flights from public.flights;  -- should be 10
select count(*) as total_seats   from public.seats;    -- should be 1740
```

### 5. Enable Realtime

In Supabase SQL Editor:
```sql
alter publication supabase_realtime add table public.seats;
alter publication supabase_realtime add table public.bookings;
```

### 6. Create Test User

In Supabase Dashboard → Authentication → Users → Add User:
- Email: `demo@skyway.com`
- Password: `password123`
- Check "Auto Confirm User"

### 7. Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000

---

## ☁️ Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial SkyWay flight management app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/skyway-flight-app.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to https://vercel.com → New Project
2. Import your GitHub repository
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL      = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   ```
4. Click Deploy

### 3. Update Supabase Auth URLs

In Supabase → Authentication → URL Configuration:
- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/**`

---

## 📱 PWA Configuration

| Resource | Cache Strategy | TTL |
|----------|---------------|-----|
| `/api/flights*` | StaleWhileRevalidate | 1 hour |
| `/api/bookings*` | StaleWhileRevalidate | 24 hours |
| JS / CSS / Images | CacheFirst | 30 days |
| Pages | NetworkFirst | 24 hours |

Offline fallback: `/offline.html` shown when no connectivity.
My Bookings reads from last-cached localStorage data when offline.

---

## 🔍 Lighthouse PWA Score

![Lighthouse Score](./screenshots/lighthouse-pwa.png)

**Score: 96 / 100**

To run your own Lighthouse audit:
1. `npm run build && npm run start`
2. Open Chrome DevTools → Lighthouse tab
3. Select "Progressive Web App" → Analyze

---

## 📁 Project Structure

```
skyway-flight-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── flights/route.ts          Flight search API
│   │   │   ├── bookings/route.ts         Bookings CRUD
│   │   │   ├── bookings/[id]/cancel/     Cancel RPC
│   │   │   └── seats/route.ts            Seat map API
│   │   ├── search/page.tsx               Flight search UI
│   │   ├── results/page.tsx              Search results
│   │   ├── seats/page.tsx                Seat map selection
│   │   ├── booking/page.tsx              Passenger details form
│   │   ├── confirmation/page.tsx         Booking confirmation + PNR
│   │   ├── bookings/page.tsx             My Bookings management
│   │   ├── auth/page.tsx                 Sign in / Sign up
│   │   └── offline/page.tsx             Offline fallback
│   ├── components/
│   │   ├── ui/Navbar.tsx                 Shared navbar with auth
│   │   └── seat/SeatMap.tsx             Realtime seat grid
│   ├── store/
│   │   ├── useFlightStore.ts             Booking flow + persist
│   │   └── useUserStore.ts              Auth session + cache
│   ├── lib/supabase.ts                   Browser + server clients
│   └── types/index.ts                    TypeScript interfaces
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rpc_functions.sql
│       └── 003_seed_data.sql
├── public/
│   ├── manifest.json                     PWA manifest
│   ├── offline.html                      Offline fallback page
│   └── icons/                           PWA icons 192x192, 512x512
├── .env.example
├── next.config.js                        PWA + Next.js config
└── README.md
```

---

## 🔐 Security Notes

- Supabase anon key is the only key exposed to the client — safe by design
- Service role key used only in server-side Route Handlers
- RLS enforces data isolation — users can only access their own bookings
- Passport numbers excluded from Zustand persist via `partialize`
- All destructive operations go through Supabase RPCs with server-side validation
