# Portfolio Website — AI IDE Prompt

## Context

Build a personal portfolio website for **Muhammad Rafay Irfan**, a final-year CS student at GIK Institute with real production experience (Google Summer of Code, two software engineering internships, and several fullstack projects). The site must be built with a specific technology stack chosen to demonstrate job-readiness for a junior fullstack role.

---

## Technology Stack (non-negotiable — these are the learning targets)

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + TypeScript | Core job requirement |
| Styling | Tailwind CSS | Industry standard, fast to build |
| Backend | Node.js + Express + TypeScript | Core job requirement |
| Database | PostgreSQL | Core job requirement |
| ORM | Prisma | Industry best practice for Node+Postgres |
| API style | REST | Core job requirement |
| Version control | Git + GitHub | Required |
| Runtime | Node.js (v18+) | Required for backend |

Do **not** use Next.js, Vite SSR, or any meta-framework. Use plain Create React App or Vite (client-side only) for the frontend, and a separate Express server for the backend. This separation teaches the fullstack mental model explicitly.

---

## Project Structure

```
rafay-portfolio/
├── frontend/                  # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # Shared TypeScript interfaces
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                   # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/            # Express route handlers
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Express middleware
│   │   ├── types/             # TypeScript interfaces
│   │   └── index.ts           # Entry point
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── package.json
│
└── README.md
```

---

## Pages & Features

### 1. Hero / Landing (`/`)
- Full-screen intro section
- Name, title ("CS Student & Open Source Developer"), and a one-line tagline
- Two CTA buttons: "View My Work" (scrolls to projects) and "Download CV" (downloads PDF from backend)
- Subtle animated background (CSS only — no heavy libraries)

### 2. About (`/about` or section)
- Short bio paragraph
- Skills grid — grouped by category:
  - **Languages:** C++, JavaScript, TypeScript, Python, Java
  - **Frontend:** React, Next.js, Tailwind CSS, HTML5/CSS3
  - **Backend & APIs:** Node.js, FastAPI, REST API design
  - **Databases:** PostgreSQL, MySQL
  - **Cloud & DevOps:** AWS (EC2, Lambda, RDS, S3, ECS/Fargate), Docker, Kubernetes, CI/CD
  - **ML/AI:** PyTorch, LangChain, RAG, LLMs, XGBoost
  - **Tools:** Git, GitHub/GitLab, CMake, Google Test, Linux
- Skills should be fetched from the backend API (not hardcoded in JSX) to practice data fetching

### 3. Experience (section or page)
Display the following work experience — fetched from the backend:

**Google Summer of Code** (May 2025 – Sep 2025) — Open Source Developer, Remote
- Owned a complex deliverable end-to-end: scoped from first principles, implemented in C++, and shipped with a 50+ case test suite covering edge cases — merged into a production codebase used by millions.
- Replaced fragile floating-point logic with error-bounded interval arithmetic, resolving a long-standing robustness gap in lib2geom.
- Collaborated asynchronously with senior open-source maintainers through structured code review cycles, raising API surface design standards.

**Inkscape** (Oct 2024 – May 2025) — Open Source Developer, Remote
- Independently diagnosed and resolved high-impact bugs across rendering, tool interaction, and editor state layers in a multi-hundred-thousand-line C++/GTK project with no onboarding documentation.
- Maintained CI integrity across 5+ dependent tool behaviors and delivered regression-free fixes improving reliability for 3M+ active users.
- Communicated technical decisions clearly in async review threads, contributing to knowledge-sharing across a globally distributed contributor base.

**Systems Limited** (Jul 2023 – Sep 2023 & Jul 2024 – Sep 2024) — Software Engineering Intern, Lahore
- Designed and deployed cloud solutions on AWS (EC2, S3, RDS, Lambda), containerized workloads with Docker and Kubernetes, and strengthened security across 3 production environments.
- Integrated cloud infrastructure into existing product workflows: RESTful API integration, database optimization on RDS, and scalable deployment practices.

### 4. Projects (section or page)
Display the following projects — fetched from the backend API with filtering by technology tag:

**SmartEngage** | Python, FastAPI, XGBoost, PyTorch, LangChain, PostgreSQL, Docker, ChromaDB
- Full-stack ML platform that ingests social media telemetry via async pipelines, predicts content virality with a hybrid ML model, and routes drafts through an agentic RAG loop backed by a vector DB and LLM orchestrator.
- Containerized with Docker; data modeling layer designed for scalable PostgreSQL queries.

**Blood Bank Management System** | PHP, MySQL, JavaScript, HTML5, CSS3
- Designed a normalized relational schema across 7 entities and built a full-stack web platform enabling real-time inventory tracking with role-based access control.
- Implemented PDO-parameterized queries and separate admin/donor portals.

**Image Segmentation Engine (HPC)** | CUDA, C++, OpenMP
- High-performance image segmentation tool using hybrid CPU/GPU parallelism.

**Multithreaded HTTP Server** | C++, Socket API, Pthreads
- Engineered a multithreaded web server from scratch using C++ sockets and a custom HTTP parser.

Each project card must show: title, description, tech stack tags, and a link field (GitHub or live). Include a tag filter bar above the grid so users can filter by technology (e.g. "React", "Python", "C++").

### 5. Contact (`/contact` or section)
- Contact form: Name, Email, Subject, Message fields
- On submit: POST to `/api/contact` → save to PostgreSQL → return success response
- Display success/error state in the UI (no page reload)
- Also show email and LinkedIn links directly

---

## Backend API — Required Endpoints

Build all of these with Express + TypeScript. Each must follow REST conventions and return proper HTTP status codes.

```
GET  /api/projects          → return all projects (array)
GET  /api/projects?tag=React → filter projects by tech tag
GET  /api/projects/:id      → return single project

GET  /api/experience        → return all work experience (sorted by date desc)

GET  /api/skills            → return skills grouped by category

POST /api/contact           → save contact form submission to DB
                              body: { name, email, subject, message }
                              returns: { success: true, id: number }

GET  /api/cv                → stream/serve the CV PDF file as a download
```

---

## Database Schema (Prisma + PostgreSQL)

```prisma
model Project {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  tags        String[] // PostgreSQL array
  githubUrl   String?
  liveUrl     String?
  featured    Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
}

model Experience {
  id           Int      @id @default(autoincrement())
  company      String
  role         String
  location     String
  startDate    String
  endDate      String?  // null = present
  bullets      String[] // PostgreSQL array
  order        Int      @default(0)
}

model Skill {
  id       Int    @id @default(autoincrement())
  name     String
  category String // e.g. "Languages", "Frontend", "Cloud & DevOps"
}

model ContactSubmission {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  subject   String
  message   String
  createdAt DateTime @default(now())
}
```

Seed the database with all the experience, projects, and skills listed above.

---

## TypeScript Requirements

- **No `any` types anywhere.** Every variable, function parameter, and return type must be explicitly typed.
- Define shared interfaces in a `types/` folder and import them — do not duplicate type definitions.
- Use `interface` for object shapes, `type` for unions and aliases.
- All async functions must have proper return types (e.g. `Promise<Project[]>`).

Example of the expected type standard:
```typescript
interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}

async function fetchProjects(tag?: string): Promise<Project[]> {
  const url = tag ? `/api/projects?tag=${tag}` : '/api/projects';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}
```

---

## React Requirements

- **Functional components only** — no class components.
- Use `useState` and `useEffect` for all state and side effects.
- Create a **custom hook** `useProjects(tag?: string)` that encapsulates the fetch logic, loading state, and error state. Use this pattern for all data fetching.
- Each page/section should handle three states: **loading**, **error**, and **success** — render appropriate UI for each.
- Props must be typed with TypeScript interfaces — no implicit `any` props.

Example custom hook pattern to follow:
```typescript
function useProjects(tag?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchProjects(tag)
      .then(setProjects)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [tag]);

  return { projects, loading, error };
}
```

---

## Express / Backend Requirements

- Use **Express Router** — define routes in separate files under `routes/`, not all in `index.ts`.
- Add a **global error handling middleware** as the last `app.use()`.
- Add a **request logger middleware** that logs method, path, and status code for every request.
- Use **parameterized queries** everywhere — never string-interpolate user input into SQL.
- All route handlers must be `async` and wrapped in try/catch.
- Return consistent error shape: `{ error: string, status: number }`.

---

## Code Quality Standards

These match what the job description calls "clean, maintainable code":

1. **No magic numbers** — define constants with meaningful names.
2. **Single responsibility** — each function does one thing. If a function is over ~30 lines, split it.
3. **Meaningful names** — `getUserById` not `getU`, `contactSubmissions` not `cs`.
4. **Comment the why, not the what** — don't comment `// increment i`; do comment `// Prisma doesn't support array contains natively, so we filter in JS`.
5. **Consistent formatting** — use Prettier. Include a `.prettierrc` file.
6. **Environment variables** — never hardcode DB credentials or ports. Use a `.env` file and `dotenv`. Include a `.env.example`.

---

## Design Direction

**Minimal/clean aesthetic:**
- Color palette: white background (`#ffffff`), near-black text (`#0f0f0f`), one accent color (your choice — a muted blue `#2563eb` or warm amber `#d97706` work well for dev portfolios)
- Font: `Inter` for body, `JetBrains Mono` for code snippets and tech tags
- Layout: generous whitespace, clean grid, no gradients or heavy shadows
- Responsive: must work on mobile (375px) and desktop (1280px) — use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`)
- Subtle scroll-based fade-in animations using Tailwind + CSS transitions only — no animation libraries

---

## What to Build First (recommended order)

1. Initialize both projects (frontend + backend) with TypeScript configured
2. Set up PostgreSQL locally and run `prisma init` + `prisma migrate`
3. Seed the database with all content
4. Build and test all backend API endpoints (use a REST client like Thunder Client or Postman to verify)
5. Build the React frontend page by page, fetching from the live backend
6. Style with Tailwind
7. Connect contact form end-to-end (form → POST → DB → UI feedback)
8. Test the full flow, push to GitHub with a clean README

---

## README Requirements

The `README.md` must include:
- Project overview
- Tech stack list
- Local setup instructions (step by step: clone → install → configure `.env` → migrate DB → seed → run)
- API endpoint documentation (method, path, description, example response)
- Screenshots of at least 2 pages

This README is part of your portfolio — interviewers will read it.

---

## What this project teaches (map to job requirements)

| Job requirement | Where it's practiced |
|---|---|
| Fullstack system design | Separate frontend/backend with REST API between them |
| Clean, maintainable code | TypeScript strict mode, single-responsibility functions, Prettier |
| User-facing features | Every React page ships to a real URL |
| Data modeling | Prisma schema with relations, PostgreSQL arrays |
| API design | 6 REST endpoints with proper status codes |
| Code review readiness | Git commits, clean diffs, descriptive commit messages |
| Production debugging | Error states in UI, error middleware in Express, console logging |
| Speed vs quality tradeoff | Ship MVP first (hardcoded data), then refactor to DB-driven |
