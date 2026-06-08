# HD Printing & Packaging Management System

Full-stack invoice, payment, cheque, and reporting system for a printing and packaging business.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma
- Authentication: JWT
- PDF: PDFKit

## Project Structure

- `client`: React dashboard application
- `server`: Express API, Prisma schema, PDF generation logic
- `docs`: project notes for onboarding and future enhancements

## Getting Started

1. Install dependencies:
   `npm install`
2. Copy `server/.env.example` to `server/.env`
3. Copy `client/.env.example` to `client/.env`
4. Update the environment variables
5. Generate Prisma client:
   `npm run prisma:generate`
6. Run migrations:
   `npm run prisma:migrate`
7. Seed clean sample data for development or staging:
   `npm run prisma:seed`
8. Start the backend:
   `npm run dev:server`
9. Start the frontend in a second terminal:
   `npm run dev:client`

The seed command is manual only. It does not run automatically when the app starts. The script clears existing sample/test data, recreates the admin account, and repopulates the database with linked sample records. It also refuses to run when `APP_ENV`, `SEED_ENV`, `VERCEL_ENV`, or `NODE_ENV` is set to `production`.

If your staging environment uses `NODE_ENV=production`, set `APP_ENV=staging` before running the seed command so the safety check still treats it as non-production.

## Environment Variables

### Backend (`server/.env`)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hd_printing"
JWT_SECRET="replace-with-a-long-random-secret"
CLIENT_URL="http://localhost:5173"
PORT=4000
APP_ENV=development
```

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL="http://localhost:4000/api"
```

`VITE_API_BASE_URL` must point to the backend API root, including `/api`. Example staging value:

```env
VITE_API_BASE_URL="https://your-railway-backend.up.railway.app/api"
```

## Staging Deployment

Recommended hosting plan:

- Frontend: Vercel
- Backend: Railway
- Database: PostgreSQL

### 1. Prepare PostgreSQL

- Create a PostgreSQL database for staging.
- Copy the full connection string into the Railway backend as `DATABASE_URL`.

### 2. Deploy Backend to Railway

- Set the Railway service root to `server`.
- Add these backend environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CLIENT_URL`
  - `PORT`
  - `APP_ENV=staging`
- Use the production start command:
  `npm run start`
- Run Prisma migrations on the staging database:
  `npm run prisma:migrate:deploy`
- Seed staging sample data manually after deploy:
  `npm run prisma:seed`

Set `CLIENT_URL` to your Vercel frontend URL. If you want to allow both the production Vercel domain and a preview domain, set `CLIENT_URL` as a comma-separated list.

Example:

```env
CLIENT_URL="https://hd-printing.vercel.app,https://hd-printing-git-staging-yourteam.vercel.app"
```

### 3. Deploy Frontend to Vercel

- Set the Vercel project root to `client`.
- Add the frontend environment variable:
  - `VITE_API_BASE_URL=https://your-railway-backend.up.railway.app/api`
- Build command:
  `npm run build`
- Output directory:
  `dist`

### 4. Verify the Staging Build

- Open the Vercel URL.
- Confirm login works with the seeded admin account.
- Confirm API requests succeed against Railway.
- Confirm protected pages load after login.
- Confirm invoice, payment, cheque, and report screens load sample data.

## Starter Login

- Email: `admin@hdprinting.com`
- Password: `Admin@123`
