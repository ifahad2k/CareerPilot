# CareerPilot — Your Agentic Career Co-pilot

> **Every AI output is grounded in your actual CV. No agent fabricates experience. If it's not in the CV, the AI says so.**

CareerPilot is an end-to-end agentic career co-pilot that knows you personally — your CV is the single source of truth for every AI response, recommendation, score, and cover letter.

## 🎯 Live Demo

**URL:** [https://careerpilot.vercel.app](https://careerpilot.vercel.app)

Demo credentials: `demo@careerpilot.io` / `password123`

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ENTRY LAYER                         │
│  CV Upload (PDF/DOCX)  →  Text Extraction  →  Section Chunker  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RAG CORE (Single Source of Truth)            │
│                                                                 │
│  Chunk Embeddings (OpenAI)  →  pgvector (Supabase)             │
│                                                                 │
│  Query → Embed Query → Cosine Similarity → Top-K Chunks        │
│  Every agent call retrieves relevant CV context FIRST          │
└──────────┬──────────────┬───────────────┬───────────┬──────────┘
           │              │               │           │
           ▼              ▼               ▼           ▼
┌──────────────┐  ┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  Job Hunter  │  │  AI Assistant│ │  Fit     │ │  Tracker /   │
│  Agent       │  │  Chat (RAG)  │ │  Score   │ │  Nudge Agent │
│              │  │              │ │  Engine  │ │              │
│  Tool calls: │  │  - Gap Anal. │ │          │ │  - Kanban    │
│  JSearch API │  │  - Roadmap   │ │  Vector  │ │  - Calendar  │
│  Adzuna API  │  │  - Cover Ltr  │ │  Cosine  │ │  - Goals     │
│  Web Search  │  │  - Readiness  │ │  Scoring │ │  - AI Nudge  │
└──────────────┘  └──────────────┘ └──────────┘ └──────────────┘
           └─────────────────┴──────────────┴───────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                       │
│                                                                 │
│  Dashboard  │  Job Cards  │  Chat UI  │  Kanban  │  Calendar   │
│             │             │           │          │             │
│                    Supabase (Auth + Postgres + pgvector)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
careerpilot/
├── app/
│   ├── (auth)/                    # Authentication routes
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/               # Protected dashboard routes
│   │   ├── layout.tsx            # Sidebar + nav shell
│   │   ├── page.tsx              # Dashboard home (stats)
│   │   ├── jobs/page.tsx         # Job Hunter
│   │   ├── assistant/page.tsx    # AI Chat
│   │   ├── profile/page.tsx       # CV upload + profile
│   │   └── tracker/
│   │       ├── kanban/page.tsx
│   │       ├── calendar/page.tsx
│   │       └── goals/page.tsx
│   └── api/                       # API Routes
│       ├── cv/
│       │   ├── upload/route.ts    # POST: parse + embed CV
│       │   └── chunks/route.ts    # GET: list user chunks
│       ├── jobs/search/route.ts   # POST: job search agent
│       ├── fit-score/route.ts     # POST: compute fit score
│       ├── chat/route.ts           # POST: streaming AI chat
│       ├── cover-letter/route.ts   # POST: generate cover letter
│       ├── roadmap/route.ts       # POST: generate roadmap
│       └── nudge/route.ts         # POST: AI proactive nudge
│
├── components/
│   ├── ui/                        # shadcn components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── DashboardHeader.tsx
│   ├── cv/
│   │   ├── CVUploader.tsx
│   │   └── CVSectionViewer.tsx
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobSearchBar.tsx
│   │   └── FitScoreBadge.tsx
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   └── RAGSourcePanel.tsx     # Shows CV chunks used
│   ├── tracker/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanCard.tsx
│   │   ├── CalendarView.tsx
│   │   └── GoalCard.tsx
│   └── dashboard/
│       ├── StatsGrid.tsx
│       ├── ProgressBar.tsx
│       └── NudgeCard.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server Supabase client
│   │   └── middleware.ts         # Auth middleware
│   ├── ai/
│   │   ├── rag.ts                 # Core RAG query function
│   │   ├── embeddings.ts         # OpenAI embed util
│   │   ├── prompts.ts             # All system prompts
│   │   ├── tools.ts               # Agent tool definitions
│   │   └── fitScore.ts            # Fit score engine
│   ├── cv/
│   │   ├── parser.ts              # PDF/DOCX → raw text
│   │   ├── chunker.ts             # Section-aware chunking
│   │   └── embedder.ts           # Chunk → embed → pgvector
│   └── jobs/
│       └── jsearch.ts             # JSearch API wrapper
│
├── types/
│   └── index.ts                   # All shared TypeScript types
│
├── middleware.ts                  # Auth middleware (Supabase)
├── schema.sql                     # Supabase database schema
├── .env.example                   # Environment template
└── package.json
```

---

## 🗄️ Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile with target role/location |
| `cvs` | Uploaded CV files with parsed sections |
| `cv_chunks` | **RAG Vector Store** — embedded CV chunks |
| `applications` | Kanban application tracking |
| `goals` | Career goals with deadlines |
| `todos` | Tasks linked to goals |
| `chat_sessions` | Chat session metadata |
| `chat_messages` | Full conversation history (session memory) |
| `roadmaps` | Generated learning roadmaps |

### Vector Search

pgvector enables semantic search over CV chunks:

```sql
-- Match relevant CV chunks to a query
SELECT * FROM match_cv_chunks(
  query_embedding => '[1536-dim vector]',
  match_user_id => 'user-uuid',
  match_count => 5
);
```

---

## 🧩 Four Pillars

### Pillar 1 — Job Hunter Agent
- Live job search via JSearch API (RapidAPI)
- Fit score computed **programmatically** using vector cosine similarity
- Explains WHY each job matches — citing specific CV details
- No fabricated listings — only real results from API

### Pillar 2 — Profile & Resume Intelligence (RAG Core)
- Upload CV (PDF/DOCX) → Parse → Chunk → Embed → Store
- Section-aware chunking: summary, experience, education, projects, skills
- Semantic search retrieves most relevant CV context for any query
- **Every AI response is grounded in actual CV data**

### Pillar 3 — Personal AI Assistant
- Conversational career coach with full CV context
- Handles: readiness checks, skill gap analysis, roadmaps, cover letters
- Session memory — full conversation history sent to LLM
- RAG Source Panel shows which CV chunks were used

### Pillar 4 — Productivity & Progress Tracker
- **Kanban Board:** Applied → Interviewing → Offer → Rejected
- **Calendar:** Interview reminders and deadlines
- **Goals & Todos:** Linked to career objectives
- **AI Nudge:** Proactive alerts when inactive for 7+ days

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | Server actions, streaming, file-based routing |
| **Styling** | Tailwind CSS + shadcn/ui | Fast UI, accessible components |
| **LLM Provider** | Anthropic Claude Sonnet 4 | Tool-calling, streaming, structured output |
| **Embeddings** | OpenAI `text-embedding-3-small` | 1536-dim vectors, $0.02/1M tokens |
| **Vector DB** | Supabase pgvector | Free tier, SQL + vector in one DB |
| **Auth + DB** | Supabase | Postgres, RLS, built-in auth |
| **PDF Parsing** | `pdf-parse` | Serverless-compatible PDF extraction |
| **DOCX Parsing** | `mammoth` | Best DOCX → text conversion |
| **AI SDK** | Vercel AI SDK | Streaming, tool-calling, multi-provider |
| **Job Search** | JSearch API (RapidAPI) | Rich job data, free tier 500 req/mo |
| **Calendar** | Custom React + `date-fns` | Full control, lightweight |
| **Deployment** | Vercel | Free hobby, CI/CD from GitHub |

---

## 📋 API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/cv/upload` | ✅ | Upload + parse + embed CV |
| `GET` | `/api/cv/chunks` | ✅ | List user's CV chunks |
| `POST` | `/api/jobs/search` | ✅ | Job Hunter Agent (live search) |
| `POST` | `/api/fit-score` | ✅ | Compute fit score for JD |
| `POST` | `/api/chat` | ✅ | Streaming AI assistant |
| `POST` | `/api/cover-letter` | ✅ | Generate cover letter |
| `POST` | `/api/roadmap` | ✅ | Generate weekly roadmap |
| `POST` | `/api/nudge` | ✅ | AI proactive nudge |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free)
- OpenAI API key
- Anthropic API key
- JSearch API key ([RapidAPI](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch), free tier)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourname/careerpilot
cd careerpilot

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Set up Supabase database
# - Create a new Supabase project
# - Enable pgvector extension
# - Run schema.sql in SQL Editor

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

---

## 📊 Fit Score Algorithm

The fit score is computed **programmatically** — not estimated by the LLM:

```typescript
// 1. Embed job description
const jdEmbedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: jobDescription,
});

// 2. Compute similarity per CV section
const sections = ['skills', 'experience', 'education'];
for (const section of sections) {
  const { data: chunks } = await supabase.rpc('match_cv_chunks', {
    query_embedding: jdEmbedding,
    match_user_id: userId,
    match_count: 3,
    filter_section: section,
  });
  scores[section] = avg(chunks.map(c => c.similarity));
}

// 3. Weighted total
// Skills: 45%, Experience: 40%, Education: 15%
total = scores.skills * 0.45 + scores.experience * 0.40 + scores.education * 0.15;
```

---

## 🎨 UI Design System

### Layout

```
┌─────────────────────────────────────────────────┐
│  SIDEBAR (240px fixed)   │  MAIN CONTENT AREA   │
│                          │                      │
│  🚀 CareerPilot          │  [Page Content]      │
│                          │                      │
│  ── MAIN ──              │                      │
│  📊 Dashboard            │                      │
│  🔍 Job Hunter           │                      │
│  💬 AI Assistant         │                      │
│  👤 My Profile           │                      │
│                          │                      │
│  ── TRACKER ──           │                      │
│  📋 Kanban               │                      │
│  📅 Calendar             │                      │
│  🎯 Goals                │                      │
│                          │                      │
│  ── ACCOUNT ──           │                      │
│  Settings / Logout       │                      │
└─────────────────────────────────────────────────┘
```

### Color System

```css
--brand:       #3B82F6;  /* Blue — primary actions */
--brand-dark:  #1D4ED8;
--success:     #10B981;  /* Green — high fit scores */
--warning:     #F59E0B;  /* Amber — medium fit scores */
--danger:      #EF4444;  /* Red — low fit scores */
--bg:          #F8FAFC;  /* Page background */
--surface:     #FFFFFF;  /* Card background */
--border:      #E2E8F0;
--text:        #1E293B;
--muted:       #64748B;
```

---

## 📅 Phase Execution Plan

| Phase | Hours | Focus | Status |
|-------|-------|-------|--------|
| **Phase 1** | 0–12h | Foundation + RAG Core | 🔴 Critical |
| **Phase 2** | 12–28h | AI Agents + Intelligence | 🔴 Critical |
| **Phase 3** | 28–42h | UI + Tracker | 🟡 High |
| **Phase 4** | 42–56h | Polish + Deploy + Bonus | 🟢 Medium |

---

## ⚠️ Known Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| JSearch API rate limit (500/mo) | Cache results in Supabase; add Adzuna fallback |
| PDF parsing fails on complex layouts | Fall back to `pdfjs-dist`; warn user |
| Vercel file size limit (4.5MB) | Validate file size; clear error message |
| LLM returns non-JSON | Retry once; strip markdown fences |
| pgvector not enabled | Prominent step in setup docs |
| Demo CV not pre-loaded | Seed script for demo user on deploy |

---

## 📄 License

MIT License — Codesprint 2026 · Powered by Poridhi.io
