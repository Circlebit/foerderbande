# FOMo (Funding Opportunity Monitor)

A monorepo for a system that monitors funding opportunities, including:

- **Frontend** (`packages/fomo-frontend`) – Vite + React
- **Docker Services** (Supabase, etc.) – managed via Docker Compose in `/docker`

## Getting Started

### 0. Requirements

- **Node.js** ≥ 22.0.0
- **pnpm** ≥ 10.0.0

(lower version might work but aren't tested)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start development environment

```bash
pnpm dev
```

This will:

- Start Docker services (e.g. Supabase) via `docker/compose.yaml`

### 3. View logs (optional)

```bash
pnpm dev:logs
```

### 4. Stop all services

```bash
pnpm dev:down
```

### 5. Clean all volumes and data

```bash
pnpm dev:clean
```
