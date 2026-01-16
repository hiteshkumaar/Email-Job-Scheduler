# Email Job Scheduler

A production-grade email scheduler service with a dashboard, built with Express, BullMQ, Redis, PostgreSQL, and Next.js.

## Features
- **Reliable Scheduling**: Uses BullMQ + Redis for persistent job scheduling.
- **Concurrency & Rate Limiting**: Configurable worker concurrency and hourly rate limits.
- **Resilience**: Survives server restarts.
- **Frontend Dashboard**: Schedule, view, and manage emails.
- **Google Login**: Secure access via Google OAuth.

## Prerequisites
- Docker & Docker Compose
- Node.js (v16+)

## Setup

1. **Clone and Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Environment Configuration**
   - **Backend**: Rename `backend/.env.example` to `.env` (created by default) and update:
     - `DATABASE_URL`: Postgres connection string
     - `REDIS_HOST`: Redis host
     - `GOOGLE_CLIENT_ID`: Your Google Auth ID
   - **Frontend**: Check `frontend/.env.local`.

3. **Infrastructure**
   Start Redis and Postgres:
   ```bash
   docker-compose up -d
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Run the Application**
   - **Backend**:
     ```bash
     cd backend
     npm run dev
     ```
   - **Frontend**:
     ```bash
     cd frontend
     npm run dev
     ```

## API Documentation
- `POST /api/emails/schedule`: Schedule new emails. Supports JSON or CSV upload.
- `GET /api/emails/scheduled`: List pending jobs.
- `GET /api/emails/sent`: List history.

## Architecture
- **Worker**: Located in `backend/src/worker/emailWorker.ts`. Handles rate limiting per hour using Redis keys.
- **Queue**: BullMQ `email-send-queue`.
- **Throttling**: Enforced delay between sends using `setTimeout` in worker and BullMQ options.
