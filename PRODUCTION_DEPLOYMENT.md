# YojanaSathi — Enterprise Production Deployment Guide

This guide provides end-to-end instructions for deploying YojanaSathi to production environments with high availability, security hardening, and database connection pooling.

---

## 1. Quick Start: Docker Compose (Single Server / VPS)

The fastest method to deploy YojanaSathi on a cloud VM (AWS EC2, DigitalOcean Droplet, Linode, Hetzner):

### Prerequisites
- Docker (v24.0+) & Docker Compose (v2.20+)
- Domain pointed to your server IP (A Record $\rightarrow$ Server IP)

### Deployment Steps
```bash
# 1. Clone repository
git clone https://github.com/your-org/yojanasathi.git
cd yojanasathi

# 2. Configure production credentials in docker-compose.yml or .env
cp .env.example .env

# 3. Launch the containerized stack (Next.js App + PostgreSQL)
docker compose up -d --build

# 4. Verify service health
docker compose ps
curl http://localhost:3000/api/health
```

---

## 2. Cloud Serverless: Vercel + Managed PostgreSQL (Supabase / Neon)

### Database Setup
1. Create a PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Use the connection pooled string (port 6543 / PgBouncer mode) as `DATABASE_URL`.
3. Push schema and seed verified data:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

### Vercel Deployment
1. Import repository on [Vercel](https://vercel.com).
2. Configure Environment Variables in Project Settings:
   - `DATABASE_URL`: `postgresql://...`
   - `NEXT_PUBLIC_APP_URL`: `https://your-domain.com`
   - `APISETU_CLIENT_ID`: (Your official API Setu Client ID)
   - `APISETU_API_KEY`: (Your official API Setu Key)
3. Build Command: `npm run build`
4. Output Directory: `.next`
5. Deploy.

---

## 3. Production Health & Monitoring

YojanaSathi exposes a dedicated enterprise health probe:
- **Endpoint**: `GET /api/health`
- **Response Format**:
  ```json
  {
    "status": "UP",
    "timestamp": "2026-11-10T11:00:00.000Z",
    "uptime_seconds": 3600,
    "environment": "production",
    "version": "2.0.0",
    "checks": {
      "database": "CONNECTED",
      "ml_model": "READY",
      "schemes_count": 672
    }
  }
  ```
- **Integrations**: Configure this endpoint as the target for AWS ALB Health Checks, GCP Cloud Load Balancer, Kubernetes Liveness Probes, or UptimeRobot.

---

## 4. Security Hardening Checklist

- [x] **HTTP Headers**: Enforced via `next.config.mjs` (HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy).
- [x] **Powered-By Header**: Disabled (`poweredByHeader: false`) to prevent framework fingerprinting.
- [x] **API Rate Limiting**: Built-in sliding-window limiter in `src/lib/rateLimit.js` protects AI and search routes against denial of service.
- [x] **Unprivileged Container User**: Docker runs under non-root system user `nextjs:nodejs` (`UID 1001`).
- [x] **Database Isolation**: PostgreSQL connection restricted via credentials and schema parameters; zero SQL injection vulnerability via Prisma parameterized queries.
- [x] **Error Masking**: Client-facing error boundaries (`error.jsx`, `global-error.jsx`) prevent internal stack traces from leaking to end users.

---

## 5. Automated CI/CD Pipeline

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that validates every commit:
- Automated spin-up of PostgreSQL 16 service container.
- Full execution of Unit, Integration, Regression, and Realistic ML test suites (139 tests).
- Production build compilation verification.

