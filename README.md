# AI Hackathon — Frontend

Next.js dashboard on Vercel, calling the FastAPI backend on Render.

## Prerequisites

- Node.js 18.18+
- npm
- Backend on Render (or running locally on port 8000)

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

Open [http://localhost:3000](http://localhost:3000).

## Deploy

### Step 1 — Backend on Render

Deploy `backend-fastapi` on Render first. See the [backend README](https://github.com/Asadyousaf03/backend-fastapi#deploy-to-render).

Copy your Render URL, e.g. `https://backend-fastapi.onrender.com`.

### Step 2 — Frontend on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import `Asadyousaf03/frontend-nextjs`.
2. Add environment variable:

```
NEXT_PUBLIC_API_URL=https://backend-fastapi.onrender.com
```

Use your actual Render URL, no trailing slash.

3. Deploy and copy your Vercel URL.

### Step 3 — CORS on Render

In Render → your backend service → **Environment**:

```
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

Save and redeploy the backend.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run start` | Run production server    |

## Configuration

```ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
```

| Environment | `NEXT_PUBLIC_API_URL` |
|---|---|
| Local | not set (defaults to `localhost:8000`) |
| Production | `https://your-service.onrender.com` |
