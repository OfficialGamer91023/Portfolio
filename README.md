# Muhammad Rafay Irfan — Portfolio

A fullstack portfolio website built with React, TypeScript, Express, and PostgreSQL. Designed to showcase real production experience from Google Summer of Code, Inkscape contributions, and software engineering internships.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Styling | Tailwind CSS v3 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| API Style | REST |

## Local Setup

### Prerequisites

- Node.js v18+
- PostgreSQL 16
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/rafay/rafay-portfolio.git
cd rafay-portfolio
```

### 2. Set Up the Database

```bash
# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@16

# Create the database
createdb rafay_portfolio
```

### 3. Set Up the Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Run database migrations
npx prisma migrate dev

# Seed the database with portfolio content
npx ts-node --compiler-options '{"lib":["ES2020"],"types":["node"],"module":"commonjs","esModuleInterop":true}' prisma/seed.ts

# Start the backend server
npm run dev
# Server runs on http://localhost:3001
```

### 4. Set Up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
# App runs on http://localhost:5173
```

## API Documentation

All endpoints return JSON. Error responses follow the shape `{ error: string, status: number }`.

### `GET /api/projects`

Returns all projects, optionally filtered by tag.

**Query Parameters:**
- `tag` (optional) — filter by technology (e.g., `?tag=Python`)

**Example Response:**
```json
[
  {
    "id": 1,
    "title": "SmartEngage",
    "description": "Full-stack ML platform...",
    "tags": ["Python", "FastAPI", "XGBoost"],
    "githubUrl": "#",
    "liveUrl": null,
    "featured": true,
    "order": 0,
    "createdAt": "2026-06-26T22:54:46.000Z"
  }
]
```

### `GET /api/projects/:id`

Returns a single project by ID.

**Status Codes:** `200` success, `404` not found, `400` invalid ID

### `GET /api/experience`

Returns all work experience sorted by order.

**Example Response:**
```json
[
  {
    "id": 1,
    "company": "Google Summer of Code",
    "role": "Open Source Developer",
    "location": "Remote",
    "startDate": "May 2025",
    "endDate": "Sep 2025",
    "bullets": ["Owned a complex deliverable..."],
    "order": 0
  }
]
```

### `GET /api/skills`

Returns skills grouped by category.

**Example Response:**
```json
[
  {
    "category": "Languages",
    "skills": ["C++", "JavaScript", "TypeScript", "Python", "Java"]
  },
  {
    "category": "Frontend",
    "skills": ["React", "Next.js", "Tailwind CSS", "HTML5/CSS3"]
  }
]
```

### `POST /api/contact`

Saves a contact form submission.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Job Opportunity",
  "message": "Hi Rafay, I'd like to discuss..."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "id": 1
}
```

**Status Codes:** `201` created, `400` validation error, `500` server error

### `GET /api/cv`

Downloads the CV as a PDF file with `Content-Disposition: attachment`.

**Status Codes:** `200` success, `404` file not found

## Project Structure

```
Portfolio/
├── frontend/                  # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level section components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # Shared TypeScript interfaces
│   │   └── App.tsx            # Main application
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── vite.config.ts         # Vite config with API proxy
│
├── backend/                   # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/            # Express route handlers
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Logger & error handler
│   │   ├── types/             # TypeScript interfaces
│   │   └── index.ts           # Entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seed script
│   ├── assets/
│   │   └── cv.pdf             # CV file (replace with actual)
│   └── .env.example           # Environment variable template
│
├── .prettierrc                # Code formatting config
└── README.md
```

## Architecture

The frontend and backend are completely separate applications:

- **Frontend** (port 5173): React SPA that fetches all data from the backend API. Vite proxies `/api` requests to the backend during development.
- **Backend** (port 3001): Express REST API connected to PostgreSQL via Prisma ORM. Serves data and handles contact form submissions.

This separation demonstrates the fullstack mental model — frontend and backend communicate exclusively through HTTP/REST.

## License

MIT
