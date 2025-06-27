# Multi-stage Dockerfile for Frontend
FROM node:22-alpine AS base

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Development stage
FROM base AS development
EXPOSE 3000
# Vite dev server with host binding for Docker
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# Build stage
FROM base AS build
# Build the application
RUN pnpm build

# Production stage
FROM nginx:alpine AS production
# Copy custom nginx config
COPY --from=build /app/docker/nginx.conf /etc/nginx/nginx.conf
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]