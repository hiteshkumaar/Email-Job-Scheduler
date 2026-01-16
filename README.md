# Email Job Scheduler

A production-grade email scheduler service with a comprehensive dashboard, built with Express, BullMQ, Redis, PostgreSQL, and Next.js.

## 🚀 Features

*   **Smart Scheduling**: Schedule emails for exact times or with delayed intervals.
*   **Persistent Queue**: Uses **BullMQ** + **Redis** (Upstash) to ensure jobs survive server restarts.
*   **Database**: **PostgreSQL** (Neon) for robust user and job data storage.
*   **Google Auth**: Secure sign-in using Google OAuth 2.0.
*   **CSV Upload**: Bulk schedule emails by uploading CSV files.
*   **Dashboard**:
    *   **Compose**: Rich text editor for email body.
    *   **Scheduled**: View and monitor pending jobs.
    *   **Sent**: Track delivered emails.
*   **Resilience**: Handles network failures and retries automatically.

---

## 🏗️ Architecture

The system is split into two reliable micro-services:

### 1. Backend (Node.js/Express)
*   **API Layer**: Handles authenticated requests for scheduling and retrieving jobs.
*   **Worker**: A dedicated worker (`emailWorker.ts`) processes the BullMQ queue.
*   **Throttling**: Enforced delay between emails to respect provider limits (configured per job batch).
*   **Tech Stack**: Express, Prisma (ORM), BullMQ, Nodemailer.

### 2. Frontend (Next.js 16)
*   **Framework**: Next.js App Router with TypeScript.
*   **Styling**: Tailwind CSS for a modern, responsive UI.
*   **Auth**: NextAuth.js configured with Google Provider.

---

## 🛠️ Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   **Neon Database** (PostgreSQL)
*   **Upstash Redis** (Serverless Redis)
*   Google Cloud Console Project (for OAuth)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Email-Job-Scheduler
```

### 2. Backend Setup
```bash
cd backend
npm install
```

**Configure Environment (`backend/.env`):**
```env
PORT=3000
# Connection string from Neon Console
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"

# Connection string from Upstash Console (use the rediss:// URL)
REDIS_URL="rediss://default:password@endpoint.upstash.io:6379"

# Google Auth (for backend session validation if needed)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

SESSION_SECRET="your-super-secret-key"
FRONTEND_URL="http://localhost:3001"
```

**Initialize Database:**
```bash
npx prisma generate
npx prisma db push
```

**Start Backend:**
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

**Configure Environment (`frontend/.env.local`):**
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_API_URL="http://localhost:3000/api/emails"
```

**Start Frontend:**
```bash
npm run dev -- -p 3001
```

---

## 📚 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/emails/schedule` | Schedule emails. Accepts JSON (body, subject, recipients) or `multipart/form-data` (CSV file). |
| `GET` | `/api/emails/scheduled` | List all jobs currently in the PENDING state. |
| `GET` | `/api/emails/sent` | List all completed (SENT/FAILED) jobs. |

---

## ☁️ Deployment

*   **Frontend**: Deployed on **Vercel**.
*   **Backend**: Deployed on **Render** (Web Service).
*   **Infrastructure**: Neon (DB) & Upstash (Redis).

See `deployment_guide.md` for detailed deployment instructions.
