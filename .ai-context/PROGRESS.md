# CareerPilot v2 — AI Agent Progress Context

> **This file is the single source of truth for AI agents working on this project.**
> **Update this file whenever progress is made.**

---

## 📋 Project Overview

**Name:** CareerPilot v2 — Your AI Career Co-pilot
**GitHub:** https://github.com/ifahad2k/CareerPilot
**Framework:** Next.js 14 (App Router)
**Last Updated:** May 24, 2026

**Core Mission:** An AI-powered career assistant where every AI output is grounded in the user's actual CV. The CV is the single source of truth for recommendations, scores, and cover letters.

**v2 Changes:** Migrated from Supabase + OpenAI/Anthropic to Firebase + Gemini + Adzuna for cost reduction and simplicity.

---

## ✅ COMPLETED TASKS

### Phase 1: Foundation & Architecture (100%)

| Task | Status | File(s) |
|------|--------|---------|
| Directory structure | ✅ Done | 35+ directories created |
| Next.js 14 App Router setup | ✅ Done | `app/layout.tsx`, `app/page.tsx`, `next.config.ts` |
| TypeScript configuration | ✅ Done | `tsconfig.json`, `types/index.ts` |
| Tailwind CSS setup | ✅ Done | `tailwind.config.ts`, `app/globals.css` |
| shadcn/ui base components | ✅ Done | 9 components in `components/ui/` |
| Utility functions | ✅ Done | `lib/utils.ts`, `hooks/use-toast.ts` |

### Phase 2: Database & Backend Infrastructure (100%)

| Task | Status | File(s) |
|------|--------|---------|
| Firebase configuration | ✅ Done | `lib/firebase/client.ts`, `admin.ts`, `auth.ts` |
| Environment template | ✅ Done | `.env.example` |
| Firestore collections | ✅ Scaffolded | cvChunks, applications, goals, todos, chatSessions |

### Phase 3: API Routes (100%)

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

### Phase 5: Pages & Components (100%)

| Page/Component | Status | File |
|----------------|--------|------|
| Login page | ✅ Scaffolded | `app/(auth)/login/page.tsx` |
| Signup page | ✅ Scaffolded | `app/(auth)/signup/page.tsx` |
| Dashboard layout | ✅ Scaffolded | `app/(dashboard)/layout.tsx` |
| Dashboard home | ✅ Scaffolded | `app/(dashboard)/page.tsx` |
| Job Hunter page | ✅ Scaffolded | `app/(dashboard)/jobs/page.tsx` |
| AI Assistant page | ✅ Scaffolded | `app/(dashboard)/assistant/page.tsx` |
| Profile page | ✅ Scaffolded | `app/(dashboard)/profile/page.tsx` |
| Kanban tracker | ✅ Scaffolded | `app/(dashboard)/tracker/kanban/page.tsx` |
| Calendar tracker | ✅ Scaffolded | `app/(dashboard)/tracker/calendar/page.tsx` |
| Goals tracker | ✅ Scaffolded | `app/(dashboard)/tracker/goals/page.tsx` |

### Phase 4: Library/Logic Files (100%)

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

### Phase 6: Documentation (100%)

| Document | Status | File |
|----------|--------|------|
| README with architecture | ✅ Done | `README.md` |
| Git repository | ✅ Pushed | GitHub: ifahad2k/CareerPilot |

---

## 🔄 CURRENT STATE

### What Exists (Architecture Scaffold)

```
careerpilot/
├── app/
│   ├── (auth)/                  # Auth routes (login, signup)
│   │   ├── login/page.tsx       # Placeholder with comments
│   │   └── signup/page.tsx      # Placeholder with comments
│   ├── (dashboard)/             # Protected routes
│   │   ├── layout.tsx          # Sidebar + header shell
│   │   ├── page.tsx            # Dashboard with stats
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
│   ├── ai/                      # RAG, embeddings, prompts, tools, fitScore
│   ├── cv/                      # parser, chunker, embedder
│   ├── jobs/                    # jsearch wrapper
│   └── supabase/                # client, server, middleware
│
├── types/index.ts               # All TypeScript types
├── schema.sql                   # Complete Supabase schema
├── package.json                 # Dependencies
└── README.md                    # Full documentation
```

### What Needs Implementation

The placeholders contain `// TODO:` comments explaining what each file should do. **No actual business logic has been written yet.**

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
lib/cv/embedder.ts creates embeddings (OpenAI)
    ↓
Stored in Supabase pgvector (cv_chunks table)
    ↓
User query → lib/ai/rag.ts → semantic search
    ↓
Top-K chunks injected into LLM system prompt
    ↓
AI response grounded in actual CV data
```

### Fit Score Algorithm

```
1. Embed job description (OpenAI)
2. Cosine similarity search per CV section:
   - Skills: 45% weight
   - Experience: 40% weight
   - Education: 15% weight
3. Weighted total = fit score
4. LLM generates human-readable explanation
```

### Four Pillars

1. **Job Hunter Agent** — Live search via JSearch API, programmatic fit scores
2. **Profile & Resume Intelligence** — CV parsing, chunking, RAG storage
3. **Personal AI Assistant** — Conversational coach with CV context
4. **Productivity & Progress Tracker** — Kanban, Calendar, Goals, AI Nudge

---

## 🔜 NEXT STEPS (Priority Order)

### High Priority

1. **[ ] Implement `lib/cv/parser.ts`**
   - Use `pdf-parse` for PDFs, `mammoth` for DOCX
   - Extract raw text, handle errors gracefully
   - Validate file size (4.5MB Vercel limit)

2. **[ ] Implement `lib/ai/embeddings.ts`**
   - Use OpenAI `text-embedding-3-small`
   - 1536 dimensions, ~$0.02/1M tokens
   - Implement batch embedding for efficiency

3. **[ ] Implement `lib/ai/rag.ts`**
   - Query embedding → Supabase RPC `match_cv_chunks`
   - Return top-K chunks with similarity scores
   - Format context string for LLM injection

4. **[ ] Implement `app/api/cv/upload/route.ts`**
   - Parse uploaded file
   - Chunk into sections (summary, experience, education, skills, projects)
   - Embed and store in pgvector
   - Return success/chunk count

### Medium Priority

5. **[ ] Implement `app/(auth)/login/page.tsx`**
   - Supabase auth with `@supabase/ssr`
   - Redirect to dashboard on success

6. **[ ] Implement `app/(auth)/signup/page.tsx`**
   - Create account + auto-create profile
   - Email verification

7. **[ ] Implement `app/(dashboard)/layout.tsx`**
   - Sidebar navigation
   - Auth state management
   - Protected route (redirect to login if not authenticated)

8. **[ ] Implement `components/cv/CVUploader.tsx`**
   - Drag-and-drop with `react-dropzone`
   - File validation (PDF/DOCX only, <4.5MB)
   - Upload progress indicator

### Low Priority (Can Be Built After Core Works)

9. **[ ] Implement Kanban board (Zustand + Supabase)**
10. **[ ] Implement Calendar view (date-fns)**
11. **[ ] Implement AI Chat interface (streaming)**
12. **[ ] Implement Job search with JSearch API**
13. **[ ] Implement Cover letter generation**
14. **[ ] Implement Roadmap generation**
15. **[ ] Implement AI Nudge system**

---

## 📦 DEPENDENCIES

Installed in `package.json`:

```json
{
  "@anthropic-ai/sdk": "^0.24.0",
  "@supabase/ssr": "^0.4.0",
  "@supabase/supabase-js": "^2.44.0",
  "ai": "^3.3.0",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.400.0",
  "mammoth": "^1.7.2",
  "next": "14.2.4",
  "openai": "^4.52.0",
  "pdf-parse": "^1.1.1",
  "react-dropzone": "^14.2.3",
  "zustand": "^4.5.4"
}
```

---

## 🔑 API KEYS NEEDED

Create `.env.local` from `.env.example`:

| Key | Provider | Purpose |
|-----|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Database & Auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Client-side API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Server-side (RLS bypass) |
| `OPENAI_API_KEY` | OpenAI | Embeddings (text-embedding-3-small) |
| `ANTHROPIC_API_KEY` | Anthropic | LLM (Claude Sonnet 4) |
| `JSEARCH_API_KEY` | RapidAPI | Job search (free tier: 500/mo) |

---

## 🗄️ DATABASE SCHEMA

Tables created in `schema.sql`:

- `profiles` — User profile with target role/location
- `cvs` — Uploaded CV files with parsed sections
- `cv_chunks` — **RAG Vector Store** (pgvector 1536-dim)
- `applications` — Kanban application tracking
- `goals` — Career goals with deadlines
- `todos` — Tasks linked to goals
- `chat_sessions` — Chat session metadata
- `chat_messages` — Full conversation history
- `roadmaps` — Generated learning roadmaps

**Vector Search Function:** `match_cv_chunks()` enables semantic similarity search.

**RLS Policies:** All tables have row-level security — users can only access their own data.

---

## 🐛 KNOWN ISSUES

1. **No actual code implemented** — only scaffold/placeholders
2. **Linter errors expected** — dependencies not installed yet
3. **No test coverage** — tests need to be written

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
| May 24, 2026 | Fixed `lib/ai/prompts.ts` typo | `lib/ai/prompts.ts` | `stringA` → `string` |
| May 24, 2026 | Created AI agent context folder | `.ai-context/` | Progress tracking for AI agents |

---

## 🎯 GOALS

- [ ] **Phase 1: Foundation** (In Progress → 100%)
- [ ] **Phase 2: RAG Core** (Not Started)
- [ ] **Phase 3: AI Agents** (Not Started)
- [ ] **Phase 4: UI & Tracker** (Not Started)
- [ ] **Phase 5: Polish & Deploy** (Not Started)

---

*Last updated by: AI Agent | Date: May 24, 2026*
*Update this file before making any changes to keep other agents informed.*