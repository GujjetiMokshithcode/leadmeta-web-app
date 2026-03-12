# Leadmeta – Find Verified B2B & B2C Emails in Seconds

🌐 **[leadmeta.me](https://leadmeta.me)**

Stop wasting hours on cold lead research. Leadmeta instantly finds and extracts verified B2B & B2C emails from across the web — powered by AI. Perfect for sales teams, freelancers, and growth hackers who want more replies, less grinding.

---

## 🤖 AI Agent Context (For Coders & LLMs)

If you are an AI assistant analyzing this repository, this section provides the deep underlying architecture to help you debug and extend immediately without exploring every file.

### 1. App Architecture & State Flow
Because Leadmeta stores zero data on a backend DB, **all state is ephemeral and managed structurally via React State and URL parameters.**
* **The Hand-off:** The Landing Page (`/app/page.tsx`) collects the initial semantic input and lead count. It pushes to `/dashboard` via `router.push('/dashboard?q=...&target=...')`.
* **Dashboard State (`dashboard-client.tsx`):** The dashboard operates using a 4-step linear `currentStep` state machine:
  * `Step 1 (Input)` -> User confirms the query.
  * `Step 2 (Strategies)` -> Calls `/api/generate-queries` (Groq SDK). User reviews/edits the boolean queries.
  * `Step 3 (Searching)` -> Iteratively calls `/api/search` (Serper API) for *each* generated query.
  * `Step 4 (Results)` -> Renders `<ResultsTable />`. Verification occurs here via `useEmailVerifier.ts`.

### 2. API Integration Behaviors
* **Groq (`/api/generate-queries`)**: Uses `Llama 3.3 70B`. Expects a system prompt heavily focused on "Google Dorking" (e.g., `site:linkedin.com/in`). **Crucial:** It enforces a JSON structure to return purely an array of string queries.
* **Serper (`/api/search`)**: Loops through generated Dorks. For each search result, we use Regex (`emailRegex` in `lib/email-utils.ts`) against the *snippet* text returned by Serper, not scraping the HTML of the websites directly (for speed and compliance).

### 3. Email Verification Engine (`hooks/useEmailVerifier.ts`)
Verification runs **Client-Side** entirely to avoid backend bottlenecks. 
* **Layer 1 (Syntax):** Validates RFC-5322 regex.
* **Layer 2 (Disposable):** Checks against a hardcoded `DISPOSABLE_DOMAINS` array.
* **Layer 3 (Role):** Checks against a `ROLE_ACCOUNTS` array (e.g., `info@`, `admin@`).
* **Layer 4 (MX Record):** Performs a `fetch` request against Google's Public DoH (DNS over HTTPS) API (`https://dns.google/resolve?name=${domain}&type=MX`). If `Answer` exists, it passes.

### 4. SEO & Routing Nuances
* **App Router:** `next: "16.1.6"` is used.
* **MDX Blog Engine:** Located in `/app/blog/`. Standard Next.js MDX setup. Dynamic params (`[slug]/page.tsx`) use `generateStaticParams()` reading explicitly from `/content/blog/`. It uses `next-mdx-remote`.
* **SEO Metadata:** Configured heavily in `app/layout.tsx` (Root) using `metadataBase` to cleanly resolve all OG/Twitter images. Root layout injects JSON-LD `SoftwareApplication` data.

---

## Overview

Stop wasting hours on cold lead research. Leadmeta instantly finds and extracts verified B2B & B2C emails from across the web — powered by AI. Perfect for sales teams, freelancers, and growth hackers who want more replies, less grinding. The tool uses AI to generate optimized search queries, executes searches via Google, extracts emails from results, and provides client-side verification.

**Key Features:**
- AI-powered search query generation (Groq AI + Llama 3.3 70B)
- Real-time email extraction from Google search results
- Client-side email verification (syntax, disposable domains, MX records)
- CSV export with filtering options (all, verified only, selected)
- No data storage - all processing happens in real-time
- **SEO-Optimized MDX Blog** for inbound marketing

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (selective imports)
- **Animation**: Three.js (WebGL shaders)
- **Blog Content**: @next/mdx with gray-matter
- **AI**: Groq SDK (Llama 3.3 70B)
- **Search**: Serper API (Google Search)
- **Observability**: Vercel Analytics & Speed Insights
- **Deployment**: Vercel

## Project Structure

```
app/
├── page.tsx                 # Landing page with search input
├── layout.tsx               # Root layout with fonts & metadata
├── globals.css              # Global styles
├── sitemap.ts               # Dynamic sitemap (leadmeta.me)
├── robots.ts                # Robots.txt configuration
├── dashboard/
│   └── page.tsx             # Main dashboard (4-step flow)
├── privacy/
│   └── page.tsx             # Privacy Policy page
├── terms/
│   └── page.tsx             # Terms of Service page
├── blog/                    # MDX Blog Infrastructure
│   ├── page.tsx             # Blog Listing Page
│   ├── blog-styles.css      # Prose typograpy styles
│   └── [slug]/
│       └── page.tsx         # Dynamic MDX Post Page
└── api/
    ├── search/
    │   └── route.ts         # Serper API integration
    ├── generate-queries/
    │   └── route.ts         # AI query generation (Groq)
    ├── edit-queries/
    │   └── route.ts         # Batch query editing
    └── edit-query/
        └── route.ts         # Single query editing

components/
├── ui/                      # UI components (used only)
│   ├── alert.tsx
│   ├── animated-tabs.tsx    # Smooth framer-motion tabs
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── landing-search-input.tsx
│   ├── grid-distortion.tsx  # WebGL interactive shader background
│   └── progress.tsx
├── results-table.tsx        # Lead results with verification
└── ...

hooks/
└── useEmailVerifier.ts      # Email verification logic

lib/
├── email-utils.ts           # Email extraction & CSV export
└── utils.ts                 # General utilities

content/
└── blog/                    # MDX Content Directory
    ├── post-1.mdx
    └── post-2.mdx

public/
├── logo.png                 # Base icon/logo snippet 
├── logo-icon.png            # Icon-only logo
├── logo-icon.svg            # SVG favicon
├── og-image.png             # 1200x630 social sharing card
├── background-image.png     # Textured background image for shaders
└── manifest.json            # PWA manifest
```

## User Flow

1. **Landing Page** (`/`)
   - Animated WebGL background
   - Search input with AI/Manual mode toggle
   - Target lead count selector
   - Footer with legal links

2. **Dashboard** (`/dashboard?q=...&target=...`)
   - **Input View**: Query input with target selector
   - **Strategies View**: AI-generated search queries (editable)
   - **Searching View**: Live progress with email count
   - **Results View**: Data grid with verification & export

## Environment Variables

Create `.env.local`:

```env
# Required for API routes
NEXT_SERPER_API_KEY=your_serper_api_key
NEXT_GROQ_API_KEY=your_groq_api_key

# Optional (for query editing)
GEMINI_API_KEY=your_gemini_api_key
# OR
OPENAI_API_KEY=your_openai_api_key
```

Get API keys from:
- Serper: https://serper.dev
- Groq: https://groq.com

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Routes

### POST /api/generate-queries
Generates AI search queries from user description.

**Request:**
```json
{ "prompt": "CTOs at fintech startups in London" }
```

**Response:**
```json
{ "queries": ["site:linkedin.com/in/ CTO fintech London", ...] }
```

### POST /api/search
Executes Google search and extracts emails.

**Request:**
```json
{ "query": "site:linkedin.com CTO", "page": 1, "num": 20 }
```

**Response:**
```json
{
  "success": true,
  "emails": [{ "email": "john@example.com", "source": "..." }],
  "totalFound": 15
}
```

## Email Verification

Client-side verification includes:
- **Syntax validation**: RFC-compliant email format
- **Disposable domain check**: 30+ disposable email providers blocked
- **Role account filtering**: Blocks admin, noreply, etc.
- **MX record lookup**: DNS verification via Google DNS API

## Design System

### Colors
- Background: `#050505` (near black)
- Card: `#0a0a0a`, `#0f0f0f`
- Border: `rgba(255,255,255,0.1)`
- Text Primary: `rgba(255,255,255,0.9)`
- Text Secondary: `rgba(255,255,255,0.5)`
- Accent: White (`#ffffff`)

### Key Principles
- No dark blue (`#1f3dbc`) - white/transparent accents only
- Hidden scrollbars (CSS `scrollbar-width: none`)
- Glassmorphism effects with `backdrop-blur`
- Consistent border radius (`rounded-xl`, `rounded-2xl`)

## SEO

- **Sitemap**: Auto-generated at [leadmeta.me/sitemap.xml](https://leadmeta.me/sitemap.xml) (dynamically includes all MDX blog posts)
- **Robots.txt**: Configured at [leadmeta.me/robots.txt](https://leadmeta.me/robots.txt) (dashboard excluded from indexing)
- **JSON-LD Schema**: `SoftwareApplication` markup injected directly into root layout
- **Open Graph & Twitter Cards**: Full social preview metadata
- **Canonical URLs**: All pages (including dynamic blogs) point to `leadmeta.me`
- **PWA Manifest**: Installable web app support

## Privacy & Data

- **No storage**: Search queries and results are not stored
- **No accounts**: No user registration or login required
- **Client-side processing**: Email verification happens in browser
- **Third-party APIs**: Groq (AI), Serper (Search), Google DNS (Verification)

## License

MIT License - See [Terms of Service](https://leadmeta.me/terms) for usage restrictions.
