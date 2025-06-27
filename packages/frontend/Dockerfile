# Multi-stage Dockerfile for Frontend
FROM node:22-alpine AS base

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including dev dependencies for development builds)
RUN pnpm install

# Copy all source code
COPY . .

# Development stage - extends base with dev server
FROM base AS development
EXPOSE 3000
CMD ["pnpm", "dev"]

# Build stage - creates production build
FROM base AS build
RUN pnpm build

# Production stage - serves static files
FROM nginx:alpine AS production
# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf
# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]