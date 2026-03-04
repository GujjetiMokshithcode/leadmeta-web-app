# Leadmeta

AI-powered lead discovery platform. Search for leads using AI-generated strategies or manual queries.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Animation**: Three.js (WebGL shaders)
- **API**: Serper API for Google Search

### Project Structure

```
app/
├── page.tsx              # Landing page with search input
├── layout.tsx            # Root layout with fonts & metadata
├── globals.css           # Global styles, CSS variables
├── dashboard/
│   └── page.tsx          # Main dashboard (4-step flow)
└── api/
    └── search/
        └── route.ts      # Serper API integration

components/
├── ui/                   # shadcn/ui components + custom
│   ├── landing-search-input.tsx    # Landing page search input
│   ├── animated-background.tsx     # WebGL shader background
│   └── ...               # Other shadcn components
├── results-table.tsx     # Lead results data grid
└── theme-provider.tsx    # Theme context

lib/
├── email-utils.ts        # Email extraction & CSV export
└── utils.ts              # General utilities

public/                   # Static assets
```

## User Flow

1. **Landing Page** (`/`)
   - Animated WebGL background
   - Search input with AI/Manual toggle
   - Redirects to dashboard on submit

2. **Dashboard** (`/dashboard?q=...&mode=...&target=...`)
   - **Input View**: Query input (if no URL params)
   - **Strategies View**: AI-generated search queries (AI mode only)
   - **Searching View**: Live search progress with lead count
   - **Results View**: Clean data grid with export options

## Key Components

### LandingSearchInput
Located in `components/ui/landing-search-input.tsx`
- Auto-expanding textarea
- Model toggle (AI Search / Manual)
- Submit on Enter (Shift+Enter for new line)

### AnimatedBackground
Located in `components/ui/animated-background.tsx`
- WebGL shader animation using Three.js
- Animated grid pattern
- Used on landing page and first 3 dashboard views

### ResultsTable
Located in `components/results-table.tsx`
- Fixed column layout (Email 45%, Source 30%, Extracted 15%, Actions 10%)
- Copy individual email
- Copy all emails
- Export to CSV

## Environment Variables

Create `.env.local`:
```
SERPER_API_KEY=your_serper_api_key
```

Get API key from: https://serper.dev

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

### POST /api/search
Searches Google via Serper API and extracts emails from results.

**Request Body:**
```json
{
  "query": "site:linkedin.com software engineers",
  "target": 50
}
```

**Response:**
```json
{
  "results": [
    {
      "email": "john@example.com",
      "source": "https://linkedin.com/in/john",
      "extractedFrom": "snippet"
    }
  ],
  "total": 1
}
```

## Design System

### Colors
- Background: `#050505` (near black)
- Card: `#0a0a0a`, `#0f0f0f`
- Border: `rgba(255,255,255,0.1)`
- Text Primary: `rgba(255,255,255,0.9)`
- Text Secondary: `rgba(255,255,255,0.5)`
- Text Muted: `rgba(255,255,255,0.3)`
- Accent: White (`#ffffff`)

### No Dark Blue Policy
The app strictly avoids `#1f3dbc` (dark blue). All accents use white/transparent.

### Scrollbars
All scrollbars are hidden globally via CSS while maintaining scroll functionality.

## File Naming Conventions

- Components: `kebab-case.tsx` (e.g., `landing-search-input.tsx`)
- Utilities: `kebab-case.ts` (e.g., `email-utils.ts`)
- Pages: `page.tsx`, `layout.tsx` (Next.js convention)

## Important Notes for AI Agents

1. **Color Palette**: Never use `#1f3dbc`. Use white-based colors only.
2. **Scrollbars**: Already hidden globally - don't add custom scrollbar styles.
3. **Dashboard Flow**: The 4-step view state machine handles all dashboard states.
4. **Background Animation**: Use `AnimatedBackground` component for consistent shader effects.
5. **Search Input**: Always use `LandingSearchInput` on landing page.
6. **Results Table**: Uses fixed column widths - don't change without checking layout.
