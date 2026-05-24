# CareerPilot v2 — Your AI Career Co-pilot

> **Every AI output is grounded in your actual CV. No agent fabricates experience. If it's not in the CV, the AI says so.**

CareerPilot v2 is an end-to-end AI career co-pilot that knows you personally — your CV is the single source of truth for every AI response, recommendation, score, and cover letter.

**v2 Updates:** Migrated to Firebase + Gemini + Adzuna (free) for cost reduction and simplicity.

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
│  Chunk Embeddings (Gemini)  →  Firestore (768-dim vectors)     │
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
│  Adzuna API  │  │  - Roadmap   │ │  Cosine  │ │  - Calendar  │
│  (free)      │  │  - Cover Ltr │ │  Scoring │ │  - Goals     │
└──────────────┘  └──────────────┘ └──────────┘ └──────────────┘
           └─────────────────┴──────────────┴───────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                       │
│                                                                 │
│  Dashboard  │  Job Cards  │  Chat UI  │  Kanban  │  Calendar   │
│             │             │           │          │             │
│                    Firebase (Auth + Firestore)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Decisions (v2)

### Tech Stack Changes

| Component | v1 | v2 |
|-----------|----|----|
| Auth | Supabase Auth | Firebase Auth |
| Database | Supabase PostgreSQL | Firestore |
| LLM | Anthropic Claude | Gemini |
| Embeddings | OpenAI (1536-dim) | Gemini text-embedding-004 (768-dim) |
| Vector Search | pgvector SQL | In-memory cosine similarity |
| Job API | JSearch (RapidAPI) | Adzuna (free) |
| AI SDK | Vercel AI + Anthropic | @google/generative-ai |

### Data Flow (RAG Core v2)

```
User uploads CV (PDF/DOCX)
    ↓
lib/cv/parser.ts extracts text
    ↓
lib/cv/preprocessor.ts cleans text
    ↓
lib/cv/chunker.ts splits into sections
    ↓
lib/cv/embedder.ts creates embeddings (Gemini 768-dim)
    ↓
Stored in Firestore (cvChunks collection)
    ↓
User query → lib/ai/rag.ts → in-memory cosine similarity
    ↓
Top-K chunks injected into Gemini system prompt
    ↓
AI response grounded in actual CV data
```

---

## 📁 Project Structure

```
careerpilot/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + nav shell
│   │   ├── page.tsx              # Dashboard home
│   │   ├── jobs/page.tsx         # Job Hunter
│   │   ├── assistant/page.tsx    # AI Chat
│   │   ├── profile/page.tsx       # CV upload
│   │   └── tracker/
│   │       ├── kanban/page.tsx
│   │       ├── calendar/page.tsx
│   │       └── goals/page.tsx
│   └── api/
│       ├── cv/
│       │   ├── upload/route.ts
│       │   └── chunks/route.ts
│       ├── jobs/search/route.ts
│       ├── fit-score/route.ts
│       ├── chat/route.ts
│       ├── cover-letter/route.ts
│       ├── roadmap/route.ts
│       └── nudge/route.ts
│
├── components/
│   ├── ui/                        # shadcn components
│   ├── layout/
│   ├── cv/
│   ├── jobs/
│   ├── chat/
│   ├── tracker/
│   └── dashboard/
│
├── lib/
│   ├── firebase/                  # Firebase Auth + Admin
│   │   ├── client.ts
│   │   ├── admin.ts
│   │   └── auth.ts
│   ├── ai/
│   │   ├── rag.ts                 # Core RAG function
│   │   ├── embeddings.ts         # Gemini embed util
│   │   ├── cosine.ts              # In-memory similarity
│   │   ├── prompts.ts             # System prompts
│   │   ├── tools.ts               # Agent tools
│   │   └── fitScore.ts            # Fit score engine
│   ├── cv/
│   │   ├── parser.ts              # PDF/DOCX → text
│   │   ├── chunker.ts             # Section chunking
│   │   ├── preprocessor.ts        # Text cleaning
│   │   └── embedder.ts           # Chunk → embed
│   └── jobs/
│       └── adzuna.ts              # Adzuna API wrapper
│
├── types/
│   └── index.ts                   # Shared TypeScript types
│
├── .env.example
├── .gitignore
└── package.json
```

---

## 🧩 Four Pillars

### Pillar 1 — Job Hunter Agent
- Live job search via Adzuna API (free, no rate limits)
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
| **Auth** | Firebase Auth | User authentication |
| **Database** | Firestore | NoSQL document store |
| **LLM** | Gemini 2.0 Flash | Text generation, tool-calling |
| **Embeddings** | Gemini text-embedding-004 | 768-dim vectors, free tier |
| **Vector Search** | In-memory cosine similarity | RAG chunk retrieval |
| **PDF Parsing** | `pdf-parse` | Serverless PDF extraction |
| **DOCX Parsing** | `mammoth` | DOCX → text conversion |
| **Job Search** | Adzuna API | Free job listings |
| **Calendar** | React + `date-fns` | Lightweight date handling |

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
- Firebase project (free)
- Gemini API key (Google AI Studio, free tier available)
- Adzuna API keys (free at adzuna.com/developers)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/ifahad2k/CareerPilot
cd CareerPilot/careerpilot

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Set up Firebase
# - Create Firebase project at console.firebase.google.com
# - Enable Firestore Database
# - Generate service account key (Project Settings > Service Accounts)
# - Save as service-account.json in project root (gitignored)

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

---

## 📊 Fit Score Algorithm

The fit score is computed **programmatically** using cosine similarity:

```typescript
// 1. Embed job description with Gemini
const jdEmbedding = await embedText(jobDescription);

// 2. Score each CV section
const sections = ['skills', 'experience', 'education'];
for (const section of sections) {
  const chunks = cvChunks.filter(c => c.section === section);
  scores[section] = avg(chunks.map(c => cosineSimilarity(jdEmbedding, c.embedding)));
}

// 3. Weighted total (Skills: 45%, Experience: 40%, Education: 15%)
total = scores.skills * 0.45 + scores.experience * 0.40 + scores.education * 0.15;
```

---

## ❓ FAQ

### Q: Why switch from Supabase/PostgreSQL to Firestore?
Firestore is a managed NoSQL database that eliminates the need for self-hosted vector extensions. Combined with in-memory cosine similarity, this reduces infrastructure complexity and costs significantly.

### Q: Why use Gemini instead of Claude/GPT-4?
Gemini provides both LLM capabilities and embedding generation through a single API. This simplifies authentication, reduces API call overhead, and is more cost-effective for startups. The 768-dimension embeddings are adequate for career/coaching content.

### Q: Why use Adzuna instead of JSearch?
Adzuna provides free job listings API access with no monthly fees or request limits. JSearch on RapidAPI charges based on usage, making Adzuna a better choice for budget-conscious projects.

### Q: How does the embedding generation work?
CV chunks are embedded using Gemini's `text-embedding-004` model (768 dimensions). These vectors are stored in Firestore and retrieved at query time using in-memory cosine similarity for RAG grounding.

### Q: What happens to my old data?
If you were using v1 (Supabase), you'll need to re-upload your CV after migrating to v2. The new Firebase/Firestore structure is incompatible with the old Supabase schema.

---

## 📄 License

MIT License — feel free to use this for your own career tools.

---

_Built with 🔥 by [Ifahad Khan](https://github.com/ifahad2k)_
