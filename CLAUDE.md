# Rafay's Portfolio - Claude Context

This file provides architectural, stack, and structural context for Claude. It is automatically read at the start of each session.

## Tech Stack

### Frontend
- **Framework:** React (v19) + TypeScript
- **Build Tool:** Vite (v8)
- **Styling:** Tailwind CSS (v3) + PostCSS + Autoprefixer
- **Animation:** GSAP (v3) — the only animation library. ScrollTrigger drives every
  scroll reveal, SplitText drives headline reveals, InertiaPlugin drives the hero
  dot grid. Anything expressible as a keyframe lives in `tailwind.config.js` instead.
- **Linting:** oxlint

### Backend
- **Framework:** Node.js + Express (v5) + TypeScript
- **Database:** PostgreSQL 16
- **ORM:** Prisma (v5)
- **Execution:** ts-node / ts-node-dev

## Project Structure

This is a decoupled fullstack application with separate frontend and backend directories communicating via REST API.

```
Portfolio/
├── frontend/                  # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── reactbits/     # Components adapted from reactbits.dev (see below)
│   │   ├── pages/             # Page-level section components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── data/              # Static frontend data (e.g. tech-marquee icon paths)
│   │   ├── types/             # Shared TypeScript interfaces
│   │   └── App.tsx            # Main application entry
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── vite.config.ts         # Vite config (proxies /api to backend)
│
├── backend/                   # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/            # Express route handlers
│   │   ├── controllers/       # Business logic for routes
│   │   ├── middleware/        # Custom middleware (logger, error handler)
│   │   ├── types/             # Backend TypeScript interfaces
│   │   └── index.ts           # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma Database schema
│   │   └── seed.ts            # Database seed script
│   └── .env                   # Environment variables (DB connection, etc.)
│
└── CLAUDE.md                  # This file
```

## Architectural Conventions & Design Direction

### Architecture
- **Strict Separation:** The frontend and backend are completely separate applications. The frontend only communicates with the backend via RESTful HTTP calls to `/api/...`.
- **Local Proxy:** During development, Vite proxies frontend requests starting with `/api` to the backend server (typically running on port 3001).

### Code Conventions
- **TypeScript:** Strict TypeScript is used across both frontend and backend. Interfaces/Types should be properly defined in their respective `types/` directories or colocated with components/controllers.
- **RESTful API:** Backend routes should follow REST conventions and return JSON. Error responses should uniformly follow the `{ error: string, status: number }` shape.
- **Components:** React components should be functional and utilize hooks. Tailwind utility classes are the primary method of styling.
- **Formatting:** Code formatting is managed by Prettier (via `.prettierrc` in root).

### Visual Design

- **Theme:** dark. `ink-950` is the page canvas, `ink-850` is a card surface, `ink-700`/
  `ink-600` are the two border weights, `muted` is body copy, and the blue `primary`
  scale supplies the accent (its 300–500 stops do the work on a dark ground).
  `accent` (cyan) and `violet` exist only as gradient partners. Fonts are unchanged:
  Inter for UI, JetBrains Mono for labels, tags and dates.
- **`src/components/reactbits/`** holds components adapted from reactbits.dev, each
  with a header comment recording what changed from upstream and why. They are
  adaptations, not vendored copies — retargeted to the tokens above, typed strictly,
  and rewritten where upstream pulled in a dependency this project does not carry
  (`motion`, `ogl`, `react-router-dom`, `@gsap/react`). Prefer extending one of these
  over adding a new animation package.
- **Reduced motion is a hard requirement.** Every animated component calls
  `usePrefersReducedMotion()` and renders a static equivalent — GSAP timelines, canvas
  loops and marquees must not start at all, not merely run faster. `index.css` carries
  a CSS backstop plus a `@media print` block that un-hides scroll reveals.

### Running Locally
- **Frontend:** `cd frontend && npm run dev` (Runs on `http://localhost:5173`)
- **Backend:** `cd backend && npm run dev` (Runs on `http://localhost:3001`)
- **Database:** Ensure PostgreSQL 16 is running. Prisma commands (`npx prisma migrate dev`, `npm run prisma:seed`) are used to manage schema and seed data.
