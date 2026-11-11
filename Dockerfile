# ==============================================================================
# Multi-Stage Production Dockerfile for YojanaSathi Next.js Enterprise Platform
# ==============================================================================

# Stage 1: Base & Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install exact production & dev dependencies required for build
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Production Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Set production build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true

# Build Next.js standalone application
RUN npm run build

# Stage 3: Minimal Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create unprivileged system user for enterprise security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and public directory
COPY --from=builder /app/public ./public

# Set permissions for pre-rendered cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone Next.js server output & static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy ML model artifacts and datasets required for runtime inference
COPY --from=builder --chown=nextjs:nodejs /app/ml ./ml

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

