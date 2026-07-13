# AI Hackathon — Frontend

Next.js dashboard that submits analysis queries to the FastAPI backend and displays the mock agent response.

## Prerequisites

- Node.js 18.18 or newer
- npm (included with Node.js)
- The [backend service](../backend-fastapi) running on port 8000

## Clone and setup

```bash
git clone <repository-url>
cd frontend-nextjs
npm install
```

## Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Make sure the backend is running first:

```bash
# In the backend-fastapi directory, with .venv activated
uvicorn main:app --reload --port 8000
```

## Usage

1. Enter a query in the text input.
2. Click **Run Analysis**.
3. The app calls `POST http://localhost:8000/api/analyze` and renders the response in a card showing status, summary, recommended actions, and confidence score.

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
│   ├── layout.tsx    # Root layout and global styles
│   ├── page.tsx      # Main analysis page
│   └── globals.css   # Tailwind directives
├── components/
│   ├── LoadingSkeleton.tsx
│   └── ResponseCard.tsx
├── lib/
│   └── api.ts        # Typed fetch to the backend
├── types/
│   └── analyze.ts    # Shared TypeScript types
└── package.json
```

## Configuration

The backend URL is set in `lib/api.ts`:

```ts
const API_BASE_URL = "http://localhost:8000";
```

Update this value if the API runs on a different host or port.
