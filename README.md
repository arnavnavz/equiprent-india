# EquipRent India — Heavy Machinery Rental Platform

A marketplace platform connecting heavy machinery owners with contractors and individuals who need equipment for construction projects across India.

## Features

- **Browse & Search** — Find JCBs, Cranes, Tractors, Trucks, Excavators, Bulldozers, Road Rollers, and Concrete Mixers by type, city, or keyword
- **Operator Included** — All machines come with trained operators from the owner's side
- **Booking System** — Select dates, provide project details, and request bookings with automatic pricing
- **Owner Dashboard** — List machines, manage availability, confirm/decline bookings, track earnings
- **Renter Dashboard** — Browse equipment, manage bookings, view booking history
- **Authentication** — Register as owner or renter with secure session-based auth

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4** for styling
- **Prisma 5** ORM with PostgreSQL
- **JWT** cookie-based authentication

## Deploy on Vercel

1. Push this repo to GitHub (if you have not already).
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import the GitHub repo.
3. Add a **PostgreSQL** database. Easiest options:
   - **Vercel Postgres** (Storage tab in the project, or create from the Vercel dashboard), or
   - **Neon** — create a free DB at [neon.tech](https://neon.tech) and copy the connection string.
4. In the Vercel project → **Settings** → **Environment Variables**, set:
   - `DATABASE_URL` — your Postgres connection string (must be available for **Production** and **Preview** if you want previews to work).
   - `JWT_SECRET` — a long random string (e.g. run `openssl rand -hex 32` locally).
5. Ensure both variables are enabled for **Build** as well as **Runtime** (Vercel exposes them to `npm run build` by default when you add them to the project).
6. Deploy. The build runs `prisma generate`, `prisma migrate deploy`, and `next build`, so the schema is applied automatically.
7. **Seed demo data** (once, from your machine):
   ```bash
   vercel env pull .env.local
   npx prisma db seed
   ```
   Or paste `DATABASE_URL` into a local `.env` and run `npx prisma db seed`.

**Neon note:** If you use Neon’s *pooled* URL for the app, use the *direct* (non-pooled) `DATABASE_URL` for `prisma migrate deploy` during build, or run migrations once locally against the direct URL. Neon documents “direct” vs “pooled” URLs in their dashboard.

## Local Development

```bash
cd equiprent
npm install

# Create .env (see .env.example)
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/equiprent"' > .env
echo 'JWT_SECRET="dev-secret"' >> .env

npx prisma migrate dev
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
│   │   └── seed/          # Database seeding endpoint (dev only — protect or remove in prod)
│   ├── dashboard/
│   │   ├── bookings/      # Booking management
│   │   └── listings/      # Machine listing management
│   ├── login/
│   ├── register/
│   ├── machines/          # Browse & machine detail pages
│   └── page.tsx           # Landing page
├── components/
│   └── navbar.tsx
└── lib/
    ├── auth.ts            # JWT + bcrypt helpers
    ├── constants.ts       # Machine types, Indian states, helpers
    └── db.ts              # Prisma client singleton
```
