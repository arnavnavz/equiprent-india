# EquipRent India — Heavy Machinery Rental Platform

A marketplace platform connecting heavy machinery owners with contractors and individuals who need equipment for construction projects across India.

## Features

- **Browse & Search** — Find JCBs, Cranes, Tractors, Trucks, Excavators, Bulldozers, Road Rollers, and Concrete Mixers by type, city, or keyword
- **Location-Based Suggestions** — Set your project site location and see nearby machines first
- **Owner Ratings** — Rate machine owners after completed bookings; owner ratings shown on listings
- **Operator Included** — All machines come with trained operators from the owner's side
- **Booking System** — Select dates, provide project details, and request bookings with automatic pricing
- **Review System** — Rate both machine quality and owner service after completed bookings
- **Owner Dashboard** — List machines, manage availability, confirm/decline bookings, track earnings
- **Renter Dashboard** — Browse equipment, manage bookings, write reviews, view history
- **Authentication** — Register as owner or renter with secure JWT cookie-based auth

## Tech Stack

- **Next.js 16** (App Router, standalone output)
- **Tailwind CSS 4** for styling
- **Prisma 5** ORM with PostgreSQL
- **JWT** cookie-based authentication

## Deploy on Railway

1. Push this repo to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → select this repo.
3. Add a **PostgreSQL** database:
   - In your Railway project, click **+ New** → **Database** → **Add PostgreSQL**.
   - Railway auto-injects `DATABASE_URL` into your app service.
4. Add environment variables in your app service → **Variables** tab:
   - `JWT_SECRET` — a long random string (e.g. run `openssl rand -hex 32`).
   - `DATABASE_URL` should already be set by Railway's PostgreSQL plugin (verify it's there).
5. Railway auto-detects Next.js. The build command (`prisma generate && prisma migrate deploy && next build`) runs automatically from `package.json`.
6. Deploy. Migrations apply automatically during build.
7. **Seed demo data** (optional, from your local machine):
   ```bash
   # Copy the DATABASE_URL from Railway → PostgreSQL → Variables → DATABASE_URL
   DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
   ```

## Local Development

```bash
cd equiprent
npm install

# For local dev with SQLite, change prisma/schema.prisma provider to "sqlite" and use:
echo 'DATABASE_URL="file:./dev.db"' > .env
echo 'JWT_SECRET="dev-secret"' >> .env

npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

Password for all accounts: `password123`

| Role   | Email                  | City       |
|--------|------------------------|------------|
| Owner  | rajesh@example.com     | Mumbai     |
| Owner  | suresh@example.com     | Ahmedabad  |
| Owner  | arun@example.com       | Delhi      |
| Renter | amit@example.com       | Pune       |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Login, Register, Logout, Me
│   │   ├── bookings/      # Create, List, Update bookings
│   │   ├── machines/      # CRUD for machine listings
│   │   ├── reviews/       # Review submission API
│   │   └── seed/          # Database seeding endpoint
│   ├── dashboard/
│   │   ├── bookings/      # Booking management + reviews
│   │   └── listings/      # Machine listing management
│   ├── login/
│   ├── register/
│   ├── machines/          # Browse (location-aware) & machine detail pages
│   └── page.tsx           # Landing page
├── components/
│   └── navbar.tsx
└── lib/
    ├── auth.ts            # JWT + bcrypt helpers
    ├── constants.ts       # Machine types, Indian states, helpers
    └── db.ts              # Prisma client singleton
```
