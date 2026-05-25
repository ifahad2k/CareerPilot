# CareerPilot v2 — AI Agent Progress Context

> **This file is the single source of truth for AI agents working on this project.**
> **Update this file whenever progress is made.**

---

## 📋 Project Overview

**Name:** CareerPilot v2 — Your AI Career Co-pilot
**GitHub:** https://github.com/ifahad2k/CareerPilot
**Framework:** Next.js 14 (App Router)
**Live URL:** https://careerpilot-theta.vercel.app
**Last Updated:** May 25, 2026

**Core Mission:** An AI-powered career assistant where every AI output is grounded in the user's actual CV. The CV is the single source of truth for recommendations, scores, and cover letters.

**v2 Changes:** Migrated from Supabase + OpenAI/Anthropic to Firebase (Auth/Firestore/Storage) + Gemini + Adzuna for cost reduction and simplicity.

---

## ✅ COMPLETED TASKS

### Phase 1: Foundation & Architecture (100%)

| Task | Status | File(s) |
|------|--------|---------|
| Directory structure | ✅ Done | 35+ directories created |
| Next.js 14 App Router setup | ✅ Done | `app/layout.tsx`, `app/page.tsx`, `next.config.js` |
| TypeScript configuration | ✅ Done | `tsconfig.json`, `types/index.ts` |
| Tailwind CSS setup | ✅ Done | `tailwind.config.ts`, `app/globals.css` |
| shadcn/ui base components | ✅ Done | 9 components in `components/ui/` |
| Utility functions | ✅ Done | `lib/utils.ts`, `hooks/use-toast.ts` |
| **Vercel Deployment** | ✅ Done | Deployed to Vercel, connected Git repo |

### Phase 2: Database & Backend Infrastructure (100%)

| Task | Status | File(s) |
|------|--------|---------|
| Firebase client SDK | ✅ Done | `lib/firebase/client.ts` — singleton init with getApps guard |
| Firebase Admin SDK | ✅ Done | `lib/firebase/admin.ts` — exports adminDb + adminAuth |
| Firebase Auth (server) | ✅ Done | `lib/firebase/auth.ts` — verifyIdToken via firebase-admin |
| Environment template | ✅ Done | `.env.example` |
| Environment variables | ✅ Done | `.env.local` — Firebase + Gemini keys configured |
| Firestore collections | ✅ Scaffolded | cvChunks, users, applications, goals, todos, chatSessions |

### Phase 3: API Routes (100% Scaffolded)

| Route | Method | Status | File |
|-------|--------|--------|------|
| `/api/cv/upload` | POST | ✅ Scaffolded | `app/api/cv/upload/route.ts` |
| `/api/cv/chunks` | GET | ✅ Scaffolded | `app/api/cv/chunks/route.ts` |
| `/api/jobs/search` | POST | ✅ Scaffolded | `app/api/jobs/search/route.ts` |
| `/api/fit-score` | POST | ✅ Scaffolded | `app/api/fit-score/route.ts` |
| `/api/chat` | POST | ✅ Scaffolded | `app/api/chat/route.ts` |
| `/api/cover-letter` | POST | ✅ Scaffolded | `app/api/cover-letter/route.ts` |
| `/api/roadmap` | POST | ✅ Scaffolded | `app/api/roadmap/route.ts` |
| `/api/nudge` | POST | ✅ Scaffolded | `app/api/nudge/route.ts` |
| `/api/stats` | GET | ✅ Scaffolded | `app/api/stats/route.ts` |

### Phase 5: Pages & Components (In Progress)

| Page/Component | Status | File |
|----------------|--------|------|
| Login page | ✅ **Implemented** | `app/(auth)/login/page.tsx` — split-screen, Firebase auth |
| Signup page | ✅ **Implemented** | `app/(auth)/signup/page.tsx` — split-screen, creates Firestore doc, detailed errors |
| Middleware | ✅ **Implemented** | `middleware.ts` — fb-token cookie-based route protection |
| Dashboard layout | ✅ Scaffolded | `app/dashboard/layout.tsx` |
| Dashboard home | ✅ Scaffolded | `app/dashboard/page.tsx` |
| Job Hunter page | ✅ Scaffolded | `app/dashboard/jobs/page.tsx` |
| AI Assistant page | ✅ Scaffolded | `app/dashboard/assistant/page.tsx` |
| Profile page | ✅ Scaffolded | `app/dashboard/profile/page.tsx` |
| Kanban tracker | ✅ Scaffolded | `app/dashboard/tracker/kanban/page.tsx` |
| Calendar tracker | ✅ Scaffolded | `app/dashboard/tracker/calendar/page.tsx` |
| Goals tracker | ✅ Scaffolded | `app/dashboard/tracker/goals/page.tsx` |

### Phase 4: Library/Logic Files (100% Scaffolded)

| Library | Status | File |
|---------|--------|------|
| RAG core function | ✅ Done | `lib/ai/rag.ts` |
| Embeddings (Gemini) | ✅ Done | `lib/ai/embeddings.ts` |
| Cosine similarity | ✅ Done | `lib/ai/cosine.ts` |
| System prompts | ✅ Done | `lib/ai/prompts.ts` |
| AI tools | ✅ Done | `lib/ai/tools.ts` |
| Fit score engine | ✅ Done | `lib/ai/fitScore.ts` |
| withAI wrapper | ✅ Done | `lib/ai/withAI.ts` |
| CV parser | ✅ Done | `lib/cv/parser.ts` |
| CV chunker | ✅ Done | `lib/cv/chunker.ts` |
| CV embedder | ✅ Done | `lib/cv/embedder.ts` |
| CV preprocessor | ✅ Done | `lib/cv/preprocessor.ts` |
| Adzuna API wrapper | ✅ Done | `lib/jobs/adzuna.ts` |
| Firebase client | ✅ Done | `lib/firebase/client.ts` |
| Firebase admin | ✅ Done | `lib/firebase/admin.ts` |
| Firebase auth | ✅ Done | `lib/firebase/auth.ts` |

### Phase 6: Documentation & Deployment (100%)

| Document/Task | Status | File/Location |
|----------|--------|------|
| README with architecture | ✅ Done | `README.md` |
| Git repository | ✅ Pushed | GitHub: ifahad2k/CareerPilot |
| Vercel Deployment | ✅ Live | `careerpilot-theta.vercel.app` |

---

## 🔄 CURRENT STATE

### What Exists (Architecture Scaffold)

```
careerpilot/
├── app/
│   ├── (auth)/                  # Auth routes (login, signup)
│   │   ├── login/page.tsx       # Working Firebase auth
│   │   └── signup/page.tsx      # Working Firebase auth + Firestore user
│   ├── dashboard/               # Protected routes (Renamed from (dashboard))
│   │   ├── layout.tsx          # Sidebar + header shell (Client component)
│   │   ├── page.tsx            # Dashboard with stats (Client component)
│   │   ├── jobs/page.tsx       # Job Hunter Agent
│   │   ├── assistant/page.tsx  # AI Chat (RAG)
│   │   ├── profile/page.tsx    # CV upload & profile
│   │   └── tracker/
│   │       ├── kanban/page.tsx # Kanban board
│   │       ├── calendar/page.tsx
│   │       └── goals/page.tsx
│   └── api/                     # API Routes (all scaffolded)
│       ├── cv/upload/route.ts   # Parse + embed CV
│       ├── cv/chunks/route.ts   # List chunks
│       ├── jobs/search/route.ts  # Job search agent
│       ├── fit-score/route.ts    # Fit score
│       ├── chat/route.ts         # Streaming chat
│       ├── cover-letter/route.ts # Generate letter
│       ├── roadmap/route.ts       # Generate roadmap
│       ├── nudge/route.ts         # AI nudge
│       └── stats/route.ts         # Dashboard stats
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui (9 components)
│   ├── layout/                  # Sidebar, Header
│   ├── cv/                      # CVUploader, CVSectionViewer
│   ├── jobs/                    # JobCard, FitScoreBadge, SearchBar
│   ├── chat/                    # ChatInterface, RAGSourcePanel
│   ├── tracker/                 # Kanban, Calendar, Goal cards
│   └── dashboard/              # Stats, Progress, Nudge
│
├── lib/                         # Core logic
│   ├── ai/                      # RAG, embeddings (Gemini), prompts, tools
│   ├── cv/                      # parser, chunker, embedder
│   ├── jobs/                    # Adzuna wrapper
│   └── firebase/                # client, admin, auth
│
├── types/index.ts               # All TypeScript types
├── package.json                 # Dependencies
└── README.md                    # Full documentation
```

### What Needs Implementation

The placeholders contain `// TODO:` comments explaining what each file should do. **No actual business logic has been written yet for the dashboard or APIs.**

---

## 🏗️ ARCHITECTURE DECISIONS

### Data Flow (RAG Core)

```
User uploads CV (PDF/DOCX)
    ↓
lib/cv/parser.ts extracts text
    ↓
lib/cv/chunker.ts splits into sections
    ↓
lib/cv/embedder.ts creates embeddings (Gemini text-embedding-004)
    ↓
Stored in Firestore (cvChunks collection)
    ↓
User query → lib/ai/rag.ts → semantic search via vector extension/client-side cosine
    ↓
Top-K chunks injected into LLM system prompt
    ↓
AI response grounded in actual CV data
```

### Fit Score Algorithm

```
1. Embed job description (Gemini)
2. Cosine similarity search per CV section:
   - Skills: 45% weight
   - Experience: 40% weight
   - Education: 15% weight
3. Weighted total = fit score
4. LLM generates human-readable explanation
```

### Four Pillars

1. **Job Hunter Agent** — Live search via Adzuna API, programmatic fit scores
2. **Profile & Resume Intelligence** — CV parsing, chunking, RAG storage
3. **Personal AI Assistant** — Conversational coach with CV context
4. **Productivity & Progress Tracker** — Kanban, Calendar, Goals, AI Nudge

---

## 🔜 NEXT STEPS (Priority Order)

### High Priority

1. **[ ] Fix Signup/Auth Issues**
   - Ensure Firebase console has Email/Password auth enabled
   - Ensure Firestore database is created and rules allow `read, write: if request.auth != null`
   
2. **[ ] Implement `lib/cv/parser.ts`**
   - Use `pdf-parse` for PDFs, `mammoth` for DOCX
   - Extract raw text, handle errors gracefully
   - Validate file size (4.5MB Vercel limit)

3. **[ ] Implement `lib/ai/embeddings.ts`**
   - Use Gemini `text-embedding-004`
   - 768 dimensions, free tier
   - Implement batch embedding for efficiency

4. **[ ] Implement `lib/ai/rag.ts`**
   - Query embedding → Firestore cvChunks
   - In-memory cosine similarity ranking
   - Return top-K chunks for LLM context injection

5. **[ ] Implement `app/api/cv/upload/route.ts`**
   - Parse uploaded file
   - Chunk into sections (summary, experience, education, skills, projects)
   - Embed and store in Firestore
   - Return success/chunk count

---

## 📦 DEPENDENCIES

Installed in `package.json`:

```json
{
  "firebase": "^10.12.0",
  "firebase-admin": "^12.1.0",
  "@google/generative-ai": "^0.11.0",
  "ai": "^3.1.0",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.400.0",
  "mammoth": "^1.7.2",
  "next": "14.2.4",
  "pdf-parse": "^1.1.1",
  "react-dropzone": "^14.2.3",
  "zustand": "^4.5.4"
}
```

---

## 🔑 API KEYS & ENVIRONMENT

Vercel & Local `.env.local`:

| Key | Provider | Purpose |
|-----|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase | Client SDK Auth & API |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase | Client SDK Auth |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase | Client SDK Auth & Firestore |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| Firebase | Client SDK Storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase | Client SDK |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase | Client SDK |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase | Client SDK Analytics |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase | Server-side Admin SDK |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase | Server-side Admin SDK |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase | Server-side Admin SDK |
| `GEMINI_API_KEY` | Google | LLM & Embeddings |
| `ADZUNA_APP_ID` | Adzuna | Job Search API |
| `ADZUNA_APP_KEY` | Adzuna | Job Search API |

---

## 🗄️ DATABASE SCHEMA (Firestore)

Collections:

- `users` — User profile, target role, CV status
- `cvChunks` — **RAG Vector Store** (stores CV text chunks and vector embeddings)
- `applications` — Kanban application tracking
- `goals` — Career goals with deadlines
- `todos` — Tasks linked to goals
- `chatSessions` — Chat session metadata
- `chatMessages` — Full conversation history
- `roadmaps` — Generated learning roadmaps

---

## 🐛 KNOWN ISSUES / WORKAROUNDS

1. **Vercel Build Error (`ENOENT _client-reference-manifest.js`)**
   - **Fix:** Renamed `app/(dashboard)` to `app/dashboard` to avoid routing conflicts with `app/page.tsx`
   - **Workaround:** Added `"use client"` to all empty placeholder pages in `app/dashboard` to force Next.js to trace them.
2. **Signup Error**
   - By default, Firebase returns generic errors. Updated `app/(auth)/signup/page.tsx` to print specific Firebase raw error codes (usually `auth/operation-not-allowed` or `permission-denied` due to missing Firestore DB/Rules setup).

---

## 📝 HOW TO UPDATE THIS FILE

When implementing a feature:

1. Mark the task as ✅ Done with completion date
2. Document any architectural decisions made
3. Note file(s) modified
4. Update "What Needs Implementation" section
5. Add to "IMPLEMENTATION LOG" below

---

## 📜 IMPLEMENTATION LOG

| Date | Change | Files Modified | Notes |
|------|--------|----------------|-------|
| May 24, 2026 | Initial architecture scaffold | All files | 74 files created, pushed to GitHub |
| May 25, 2026 | Created `.env.local` | `.env.local` | Firebase config + Gemini API key |
| May 25, 2026 | Fixed Firebase client init | `lib/firebase/client.ts` | Clean singleton |
| May 25, 2026 | Added adminAuth export | `lib/firebase/admin.ts` | Exports both adminDb + adminAuth |
| May 25, 2026 | Rewrote auth token verification | `lib/firebase/auth.ts` | Server-side verifyIdToken |
| May 25, 2026 | Implemented login page | `app/(auth)/login/page.tsx` | Split-screen design, Firebase auth |
| May 25, 2026 | Implemented signup page | `app/(auth)/signup/page.tsx` | Creates Firestore user doc |
| May 25, 2026 | Created middleware | `middleware.ts` | Cookie-based route protection |
| May 25, 2026 | Fixed root page | `app/page.tsx` | Cookie-based redirect |
| May 25, 2026 | Vercel Deployment | (Vercel Console) | Pushed environment variables and deployed |
| May 25, 2026 | Vercel Build Fix | `app/dashboard/*` | Renamed `(dashboard)` to `dashboard` and added `"use client"` |
| May 25, 2026 | Signup Error Fix | `app/(auth)/signup/page.tsx` | Exposed raw Firebase error codes for debugging |

---

## 🎯 GOALS

- [x] **Phase 1: Foundation & Deployment** (100% ✅)
- [ ] **Phase 2: RAG Core** (Not Started)
- [ ] **Phase 3: AI Agents** (Not Started)
- [ ] **Phase 4: UI & Tracker** (Not Started)
- [ ] **Phase 5: Polish** (Not Started)

---

*Last updated by: AI Agent | Date: May 25, 2026*
*Update this file before making any changes to keep other agents informed.*
## Update Log - May 25, 2026 (Dashboard Data Integrity)

### Completed
- Replaced hardcoded dashboard mock stats with live stats fetched from `/api/stats`.
- Implemented `GET /api/stats` in `app/api/stats/route.ts` to compute real metrics from Firestore applications.
- Ensured fresh/new users see zeroed metrics instead of random placeholder numbers.
- Added fallback auth token support in `lib/firebase/auth.ts` (Bearer header or `fb-token` cookie).
- Added `export const dynamic = 'force-dynamic'` for `/api/stats` to avoid static evaluation on authenticated route.

### Files Updated
- `app/dashboard/page.tsx`
- `app/api/stats/route.ts`
- `lib/firebase/auth.ts`

### Deployment
- Production deployment completed via Vercel CLI.
- Deployment ID: `dpl_Dkb3vKoy3DeALkcuEbu8f1ZbFfgy`
- Production URL: `https://careerpilot-theta.vercel.app`

## Update Log - May 25, 2026 (API Completion + Auth Hardening)

### Completed in this pass
- Implemented missing API route: `PATCH/DELETE /api/applications/[id]`.
- Standardized goals/events auth to Firebase token verification via `verifyAuthToken()`.
- Added ownership checks for `goals/[id]` and `events/[id]` before update/delete.
- Implemented previously placeholder APIs:
  - `POST /api/chat`
  - `POST /api/fit-score`
  - `POST /api/cover-letter`
  - `POST /api/roadmap`
  - `GET /api/nudge`
- Added dynamic route hints (`force-dynamic`) for auth-dependent API handlers.
- Replaced legacy `/dashboard/tracker/*` placeholders with redirects to canonical routes.
- Fixed logout behavior by clearing `fb-token` cookie client-side before redirecting to `/login`.
- Verified with production build (`npm run build`) passing locally.

### Files Updated
- `app/api/applications/[id]/route.ts`
- `app/api/goals/route.ts`
- `app/api/goals/[id]/route.ts`
- `app/api/events/route.ts`
- `app/api/events/[id]/route.ts`
- `app/api/chat/route.ts`
- `app/api/fit-score/route.ts`
- `app/api/cover-letter/route.ts`
- `app/api/roadmap/route.ts`
- `app/api/nudge/route.ts`
- `app/api/assistant/chat/route.ts`
- `app/api/cv/upload/route.ts`
- `app/api/cv/chunks/route.ts`
- `app/api/jobs/search/route.ts`
- `app/dashboard/tracker/page.tsx`
- `app/dashboard/tracker/kanban/page.tsx`
- `app/dashboard/tracker/calendar/page.tsx`
- `app/dashboard/tracker/goals/page.tsx`
- `components/layout/Sidebar.tsx`
