# FOMo (Funding Opportunity Monitor)

A system that monitors funding opportunities, including:

- **fomo-frontend** (`packages/frontend`) – Vite + React
- **docker services** (`/docker`) – Supabase managed via Docker Compose

## Getting Started

### 0. Tooling Requirements

- **Node.js** ≥ 22.0.0
- **pnpm** ≥ 10.0.0
- **Docker** and **Docker Compose**

(lower versions might work but aren't tested)

### 1. Environment Configuration

Copy the example environment file and customize if needed:

```bash
cp .env.example .env
```

⚠️ **Important:** The `.env` file contains default passwords and demo JWT tokens. For production use, you **must** change these values:

- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret (min. 32 characters)
- `DASHBOARD_PASSWORD` - Supabase Studio access
- `ANON_KEY` and `SERVICE_ROLE_KEY` - Generate new ones for production

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start development environment

```bash
pnpm dev
```

This will:

- Start Docker services (PostgreSQL, PostgREST, GoTrue, Kong, Studio) via `compose.yaml`
- Start Vite dev server for frontend on http://localhost:5173

### 4. Access the application

- **Frontend:** http://localhost:5173
- **Supabase Studio:** http://localhost:3001 (Database management)
- **API:** http://localhost:8000 (Kong Gateway)

### 5. View docker compose logs (optional)

```bash
pnpm dev:logs
```

### 6. Stop all services

```bash
pnpm dev:down
```

### 7. Clean all volumes and data (will delete everything!)

```bash
pnpm dev:clean
```

## Project Structure

```
foerderbande/
├── .env                    # Environment variables (copy from .env.example)
├── .env.example            # Template with safe defaults
├── compose.yaml            # Docker services definition
├── packages/
│   └── frontend/           # React frontend application
├── docker/
│   └── volumes/            # Docker volume mounts (DB data, configs)
└── README.md
```

## Development

The frontend automatically loads environment variables from the root `.env` file via Vite configuration (`envDir: '../../'`).

All services communicate through the Kong API Gateway running on port 8000, which provides authentication and routing for the Supabase backend services.
