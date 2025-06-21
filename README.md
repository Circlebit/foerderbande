# FOMo (Funding Opportunity Monitor)

A system that monitors funding opportunities, including:

- **fomo-frontend** (`packages/frontend`) – Vite + React
- **docker services** (`/docker`) – Supabase managed via Docker Compose

## Getting Started

### 0. Tooling Requirements

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
- Start Vite dev server for frontend

### 3. View docker compose logs (optional)

```bash
pnpm dev:logs
```

### 4. Stop all services

```bash
pnpm dev:down
```

### 5. Clean all volumes and data (will delete everything!)

```bash
pnpm dev:clean
```
