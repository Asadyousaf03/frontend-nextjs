# AI Hackathon — Frontend

Next.js dashboard with a built-in mock API route. Deploy everything to Vercel with no separate backend host or credit card.

## Prerequisites

- Node.js 18.18 or newer
- npm (included with Node.js)

## Clone and setup

```bash
git clone https://github.com/Asadyousaf03/frontend-nextjs.git
cd frontend-nextjs
npm install
```

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app calls the built-in API at `/api/analyze` — no separate backend required.

To use the [FastAPI backend](../backend-fastapi) locally instead, run it on port 8000 and set:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Usage

1. Enter a query in the text input.
2. Click **Run Analysis**.
3. The response card shows status, summary, recommended actions, and confidence score.

## Deploy to Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project** → import `Asadyousaf03/frontend-nextjs`.
3. Leave all settings as default. No environment variables needed.
4. Click **Deploy**.

Your app and API are live on one URL, e.g. `https://frontend-nextjs.vercel.app`.

Vercel Hobby is free and does not require a credit card.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run start` | Run production server    |
| `npm run lint`  | Run Next.js linter       |

## Project structure

```
frontend-nextjs/
├── app/
│   ├── api/analyze/route.ts  # Mock API (used in production)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── LoadingSkeleton.tsx
│   └── ResponseCard.tsx
├── lib/
│   └── api.ts
├── types/
│   └── analyze.ts
└── package.json
```

## Optional: external FastAPI backend

When you have a hosted FastAPI instance (Render, Railway, etc.), set this in Vercel:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

Without it, the app uses the built-in `/api/analyze` route on Vercel.
