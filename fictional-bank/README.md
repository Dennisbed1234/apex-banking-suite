# FirstDemo Bank — Fictional Banking Demo Application

**This is a fictional banking platform built for software-development demonstration
purposes only.** It is not a real bank, is not FDIC-insured, and does not move real money.
All account numbers, routing numbers, and balances are simulated.

## Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Chart.js, React Hook Form
- **Backend:** Node.js, Express, TypeScript, JWT auth, bcrypt, Helmet, CORS, rate limiting, Winston
- **Database:** PostgreSQL via Prisma ORM

## Project layout

```
fictional-bank/
  backend/     Express API, Prisma schema, seed script, Dockerfile
  frontend/    Next.js app (public site, customer dashboard, hidden admin portal)
  nginx/       Reverse proxy config for combined deployment
  docker-compose.yml
```

## Quick start (local, no Docker)

1. **Database**: run Postgres locally or via `docker run -p 5432:5432 -e POSTGRES_USER=bank_user -e POSTGRES_PASSWORD=bank_password -e POSTGRES_DB=fictional_bank postgres:16-alpine`
2. **Backend**
   ```
   cd backend
   cp .env.example .env      # edit DATABASE_URL / secrets as needed
   npm install
   npx prisma migrate dev --name init
   npm run prisma:seed
   npm run dev                # http://localhost:4000
   ```
3. **Frontend**
   ```
   cd frontend
   cp .env.example .env.local
   npm install
   npm run dev                # http://localhost:3000
   ```
4. Log in as the seeded demo customer: `demo.customer@fictionalbank.demo` / `DemoPass123!`
5. Admin portal (not linked anywhere in the public site — type the URL directly):
   `http://localhost:3000/secure-admin-login` — username from `SEED_ADMIN_USERNAME` (default `admin`), password from `SEED_ADMIN_PASSWORD` (default `ChangeMe123!`). **Change this before any shared deployment.**

## Quick start (Docker Compose)

```
cd backend && cp .env.example .env && cd ..
docker compose up --build
```
- Frontend: http://localhost:3000
- API: http://localhost:4000/api
- Combined via Nginx: http://localhost:80

Run migrations/seed inside the backend container once it's up:
```
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed
```

## Tests

```
cd backend
npm test
```
Included tests are smoke tests (health check, basic validation). Extend with a
disposable test database for full auth/transaction integration coverage.

## What's implemented vs. simplified

**Fully implemented:** customer register/login/logout/password reset & change/email
verify, checking & savings accounts with auto-generated demo account numbers, deposits,
withdrawals, internal transfers (atomic via Prisma transactions), transaction history,
notifications on request review, hidden admin portal with JWT auth + role-based access
(SUPPORT/MANAGER/SUPER_ADMIN), customer search/suspend/reactivate/password reset,
deposit/withdrawal approval queues, manual credit/debit with audit logging, dashboard
statistics, rate limiting, Helmet, structured logging.

**Simplified / stubbed — extend before any real use:**
- **Email delivery**: verification and password-reset "emails" are returned directly
  in the API response (`demoVerifyToken` / `demoResetToken`) instead of being sent
  via a real provider (e.g. SES, Postmark). Wire a mailer in `authController.ts`.
- **PDF statements**: the `Statement` model and list endpoint exist, but PDF
  generation isn't wired up. Add a library like `pdfkit` and populate `fileLocation`.
- **AI chatbot**: `/api/chatbot/message` is a keyword-matched FAQ responder, not an
  LLM. To make it AI-powered, call an LLM API from that route with a system prompt
  scoped to this bank's FAQ content.
- **2FA**: the `Administrator` model has `twoFactorEnabled`/`twoFactorSecret` fields
  and the login flow has a marked insertion point, but TOTP verification itself
  (e.g. via `otplib`) isn't implemented.
- **Refresh token rotation / blocklisting**: login issues both access and refresh
  tokens, but there's no `/refresh` endpoint or server-side revocation store yet —
  logout is client-side only.
- **Admin transaction/audit list UI**: the admin dashboard page wires up stats and
  customer search as a working example; the deposit/withdrawal approval queue and
  audit log *screens* aren't built yet (their API endpoints are fully implemented —
  see `adminRoutes.ts` — so it's a matter of adding list components that call them).
- **Kubernetes/production hardening, CI pipeline, monthly-statement generation job**:
  out of scope for this scaffold.

## Security notes

- Change all secrets in `.env` before any non-local deployment.
- The demo routing number (`000000000`) is a placeholder — never substitute a real
  bank's ABA routing number.
- The admin portal route is unlinked but still reachable by URL; for a real
  deployment, also restrict it at the network layer (VPN/IP allowlist).
