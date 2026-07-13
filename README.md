# AI Hackathon — Frontend

Next.js dashboard that calls the FastAPI backend as a separate deployed service.

## Prerequisites

- Node.js 18.18+
- npm
- Backend running locally or deployed on Vercel

## Local development

**Terminal 1 — Backend** (in `backend-fastapi`):

```bash
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend**:

```bash
git clone https://github.com/Asadyousaf03/frontend-nextjs.git
cd frontend-nextjs
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app calls `http://localhost:8000/api/analyze` by default.

## Deploy to Vercel

Deploy as a **separate Vercel project** from the backend.

### Step 1 — Deploy backend first

Import `Asadyousaf03/backend-fastapi` at [vercel.com/new](https://vercel.com/new).  
Copy the URL, e.g. `https://backend-fastapi.vercel.app`.

### Step 2 — Deploy frontend

1. Import `Asadyousaf03/frontend-nextjs` at [vercel.com/new](https://vercel.com/new).
2. Add environment variable:

```
NEXT_PUBLIC_API_URL=https://backend-fastapi.vercel.app
```

Use your actual backend URL, no trailing slash.

3. Deploy.

### Step 3 — Update backend CORS

In the **backend** Vercel project → Settings → Environment Variables:

```
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

Redeploy the backend after saving.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run start` | Run production server    |

## Project structure

```
frontend-nextjs/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── LoadingSkeleton.tsx
│   └── ResponseCard.tsx
├── lib/api.ts          # Calls external FastAPI backend
└── types/analyze.ts
```

## Configuration

```ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
```

Set `NEXT_PUBLIC_API_URL` in Vercel for production. Locally it defaults to port 8000.
