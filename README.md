# ModelDodge

**ModelDodge** is an AI model intelligence and benchmark wiki platform. It helps developers and researchers cut through vendor hype by combining verified benchmark evaluations with live token pricing and context window specifications to find the exact model for any workload.

---

## Why ModelDodge?

With hundreds of new LLMs and variants released every month, choosing the right model is challenging:
- Vendor claims are often cherry-picked or tested on different settings.
- Model pricing changes frequently.
- Different tasks require different strengths (e.g. reasoning vs. raw code generation vs. tool calling).

ModelDodge aggregates 80+ academic benchmarks and combines them with real-world API pricing per million tokens ($/MTok) and context windows into a clean, searchable platform.

---

## Key Features

- **Model Explorer (`/models`)**: Browse and filter 465+ AI models by provider (OpenAI, Anthropic, Google, Meta, Mistral, DeepSeek, Qwen), pricing tier (Free, Budget, Mid, Flagship), context size, and capabilities.
- **Capability Leaderboard (`/leaderboard`)**: Sortable rankings across specific domains:
  - Reasoning (GPQA, ARC, MMLU-Pro)
  - Coding (SWE-bench, LiveCodeBench, HumanEval)
  - Agentic & Tool Use (Tau-bench, Function Calling)
  - Mathematics (AIME, GSM8K, MATH)
  - Vision & Multimodal (MMBench, MathVista)
  - Long Context (RULER, Needle-in-a-Haystack)
- **Head-to-Head Comparison (`/compare`)**: Compare 2 to 4 models side-by-side with category winner badges and a shared benchmark-by-benchmark matrix table.
- **Benchmark Wiki (`/benchmarks`)**: Catalog of 80 verified benchmarks detailing evaluation methodology, scoring rules, dataset sizes, and original paper citations.
- **Workload Recommender (`/recommend`)**: Recommends the highest-fitness model based on natural language use case, monthly budget, token volume, and priorities (Quality vs. Value vs. Latency).
- **Auto-Sync for New Models (`npm run sync`)**: Uses OpenRouter's public model directory to automatically discover, index, and price newly released models without requiring an API key.

---

## Architecture & How It Works

ModelDodge uses a hybrid data architecture: local verified benchmark data combined with a live model registry.

```
                  ┌───────────────────────────────┐
                  │  OpenRouter Public API        │
                  │  (465+ models, pricing, ctx)  │
                  └──────────────┬────────────────┘
                                 │  npm run sync / /api/sync
                                 ▼
                    [ data/models.json ]
                             │
                             ├──────────────────────────┐
                             ▼                          ▼
┌────────────────────────────┴─────┐       ┌────────────┴─────────────┐
│  Curated Benchmark Dataset       │       │  Data Fusion Engine      │
│  80 benchmarks, 390+ evaluations │ ────► │  (src/lib/data.ts)       │
│  [ data/benchmarks.json ]        │       │  - Canonical key matching│
└──────────────────────────────────┘       │  - Scoring aggregation   │
                                           │  - Prompt noise filter   │
                                           └────────────┬─────────────┘
                                                        │
                 ┌──────────────────────────────────────┼──────────────────────────────────────┐
                 ▼                                      ▼                                      ▼
        /api/leaderboard                            /api/compare                           /api/recommend
                 │                                      │                                      │
                 ▼                                      ▼                                      ▼
          Leaderboard Page                       Comparison Matrix                      Recommender UI
```

### 1. Data Ingestion & Sync
- **Benchmark evaluations**: Sourced from verified benchmark snapshots (`benchmarks.json`), capturing model scores, dates, and capabilities.
- **Model specifications**: Ingested via OpenRouter public API (`scripts/sync-models.mjs`). Token prices are normalized to `$/MTok` (input, output, and cached prompt reads).

### 2. Canonical Matching & Scoring
- Benchmark model names (e.g. `GPT-4o`, `Claude-3.5-Sonnet`) are matched to live API model identifiers using canonical key normalization.
- Capability scores are macro-averaged by capability category while filtering out refusal and ablation prompt noise.

### 3. Recommender Engine
- Instead of relying on a slow or costly LLM API call, the recommender uses a deterministic multi-criteria fitness formula:
  $$\text{Fitness} = w_q \cdot \text{Quality} + w_c \cdot \text{CostFitness} + w_l \cdot \text{Latency}$$
- It extracts intent using NLP keywords, estimates monthly spending from expected token volume, and scores models within the user's budget.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Styling**: React 19, Vanilla Tailwind CSS v4, Lucide Icons
- **Language**: TypeScript
- **PWA**: Web App Manifest & Service Worker ready

---

## Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/shashankcoc/modelDodge.git
cd modelDodge

# Install dependencies
npm install

# Run the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Syncing Fresh Models

To update the catalog with the latest models released on OpenRouter:

```bash
npm run sync
```

### Production Build

```bash
npm run build
npm run start
```

---

## Project Structure

```
├── data/
│   ├── benchmarks.json        # 80 verified benchmarks snapshot
│   └── models.json            # 465+ normalized models and pricing
├── public/                    # PWA icons and web manifest
├── scripts/
│   └── sync-models.mjs        # Live OpenRouter model sync script
├── src/
│   ├── app/
│   │   ├── api/               # API route handlers (models, benchmarks, compare, recommend, sync)
│   │   ├── benchmarks/        # Benchmark directory and detail pages
│   │   ├── compare/           # Model comparison battle tool
│   │   ├── leaderboard/       # Domain-specific rankings
│   │   ├── models/            # Model explorer and detail pages
│   │   ├── recommend/         # AI model recommender wizard
│   │   ├── globals.css        # Design tokens and themes
│   │   └── page.tsx           # Homepage
│   ├── components/            # Header, MobileNav, UI components
│   ├── lib/
│   │   └── data.ts            # Scoring engine and data access layer
│   └── types/                 # Shared TypeScript interfaces
└── package.json
```

---

## Deployment

ModelDodge is optimized for deployment on [Vercel](https://vercel.com):

1. Push your changes to GitHub.
2. Import the repository into Vercel.
3. Deploy without configuring any environment variables.

---

## License

MIT
