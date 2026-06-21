# AetherAI IT Dashboard

A premium, transparency-first IT device management dashboard built for the Dell Hackathon. It surfaces AI-generated recommendations for an enterprise fleet of laptops, servers, workstations, and mobile devices while ensuring no high-impact action can execute without explicit human confirmation.

![Tech Stack](https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite)
![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Tech Stack](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript)
![Tech Stack](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

---

## Features

- **AI Recommendation Feed**: 20 realistic, domain-aligned recommendations covering security patches, storage health, firmware updates, and system configuration.
- **Audit Log**: An enterprise-grade table displaying historical logs of AI recommendations and human decisions to bridge the "Accountability gap".
- **Autonomy Dial**: A global stretch-goal setting that lets administrators control the AI's autonomy level (e.g., "Always Ask Me" vs. "Act & Notify").
- **Inline AI Transparency**:
  - Confidence indicator with plain-English labels (no raw decimals).
  - Visible reasoning steps.
  - Data-source chips.
  - Known-limitations banner prefixed with `AI Caveat:`.
- **Human-in-the-Loop Controls**: Every action requires a mandatory 2-step confirmation before `onActionConfirm` is fired.
- **Enterprise IT Data Model**: 50 devices, 200 security events, and 30 audit-log entries across laptops, servers, workstations, and mobiles.
- **Simulated AI Backend**: Optional HuggingFace Mistral-7B integration with deterministic fallbacks.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI Icons | Lucide React |
| Backend | Express + Vite middleware mode |
| AI API | HuggingFace Inference API (Mistral-7B-Instruct) |
| Data Generation | Python 3 + Faker |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+ (for data generation)

### Installation

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

### Regenerate mock data

```bash
python scripts/generate_data.py
# or, if using the bundled virtual environment:
.venv/bin/python scripts/generate_data.py
```

---

## Project Structure

```
├── public/data/              # Generated JSON datasets
│   ├── ai_recommendations.json
│   ├── audit_log.json
│   ├── devices.json
│   └── security_events.json
├── scripts/
│   └── generate_data.py      # Deterministic dataset generator
├── src/
│   ├── components/           # React UI components
│   │   ├── AuditLog.tsx
│   │   ├── AutonomyDial.tsx
│   │   ├── ConfidenceIndicator.tsx
│   │   ├── DataSourceChips.tsx
│   │   ├── HumanControls.tsx
│   │   ├── LimitationBanner.tsx
│   │   ├── ReasoningPanel.tsx
│   │   ├── RecommendationCard.tsx
│   │   └── Toast.tsx
│   ├── utils/
│   │   └── transparencyHelpers.ts
│   ├── App.tsx               # Main dashboard layout
│   ├── main.tsx              # React entry point
│   ├── mockData.ts           # Data loader / transformer
│   ├── server.ts             # Express + Vite dev server
│   ├── types.ts              # TypeScript interfaces
│   └── index.css             # Tailwind entry
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Data Model

### Devices

50 enterprise devices across four types:

- **Laptops** (20)
- **Servers** (10)
- **Workstations** (10)
- **Mobiles** (10)

Each device includes OS, department, assigned user, patch compliance, disk/RAM/CPU usage, encryption status, antivirus status, and fleet segment.

### Security Events

200 events across seven categories:

- Suspicious process
- Failed login burst
- Policy violation
- Unauthorized USB
- Anomalous traffic
- Overdue critical patch
- Config drift

### AI Recommendations

20 recommendations with:

- `title`, `summary`, `assetId`, `createdAt`
- `category` mapped to human-readable labels
- `confidenceScore` mapped to plain-English indicators
- `dataSources`, `knownLimitations`
- 3-step `reasoningSteps`
- 2 actionable `options`

### Audit Log

30 human decision records tracking Approved / Overridden / Escalated outcomes.

---

## Transparency & Human-in-the-Loop

This project is designed to satisfy strict explainability and safety requirements:

1. **No raw confidence numbers** are shown to users. Scores like `0.87` are translated into labels such as "High Confidence".
2. **No system enums** like `SECURITY_FLAG` appear in the UI. They are mapped to "Security Alert", "Maintenance Required", etc.
3. **Reasoning, data sources, and limitations** are rendered inline on every card.
4. **Every high-impact action** requires a 2-step confirmation. Clicking an action button reveals an inline confirmation box; `onActionConfirm` is only fired after the user clicks "Confirm & Execute".

---

## API Endpoints

The dev server exposes two backend endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/explain-recommendation` | Explains a recommendation in plain English using Mistral-7B (with fallback). |
| `POST` | `/api/simulate-recommendation` | Generates a simulated recommendation from an asset type and scenario (with fallback). |

To use the live LLM features, set a HuggingFace token in `.env`:

```bash
HF_API_KEY=your_huggingface_api_token_here
```

If the key is missing or the API fails, deterministic fallback responses are returned automatically.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite + Express dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |

---

## License

Private — Dell Hackathon submission.
