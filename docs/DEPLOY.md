# Deployment Guide

This guide explains how to build, deploy and scale the Match-Day Itinerary Planner monorepo in production environments.

## Overview

The project consists of two independent workspaces that can be built separately and deployed to different infrastructure:

- **Frontend**: Static JavaScript application served via CDN or web server
- **Backend**: Node.js API server handling requests and data persistence

## Building Workspaces Separately

### Build Both Workspaces

```bash
npm run build
```

This creates:

- `frontend/dist/` — Optimised frontend bundle
- `backend/dist/` — Node.js backend bundle

### Build Individual Workspaces

```bash
# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend
```

### Rebuild Outputs

- **Frontend**: HTML, CSS, JavaScript bundles optimised with Vite
- **Backend**: Compiled TypeScript and bundled dependencies
- **Size**: Frontend ~50-100KB gzipped, Backend ~2-5MB depending on dependencies

## Pre-Deployment Checklist

Before deploying to production, verify the following:

### Code Quality

- [ ] All tests pass: `npm test`
- [ ] Type-check succeeds: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] No console errors or warnings
- [ ] No hardcoded secrets or credentials in code
- [ ] All environment variables documented

### Build Verification

- [ ] Frontend builds without errors: `npm run build:frontend`
- [ ] Backend builds without errors: `npm run build:backend`
- [ ] Build output files exist and are correct size
- [ ] Source maps generated (for debugging in production)

### Environment Setup

- [ ] All required environment variables defined
- [ ] Sensitive variables stored in secret management (not in repo)
- [ ] CORS origins configured correctly
- [ ] API endpoints and URLs updated for production
- [ ] Database connection string verified
- [ ] Logging level appropriate for production

### Security

- [ ] HTTPS/TLS certificates configured
- [ ] API authentication enabled (JWT, OAuth, etc.)
- [ ] Rate limiting configured
- [ ] CORS headers properly set
- [ ] Secrets scanning: `npm audit`
- [ ] Dependencies up to date with no critical vulnerabilities

### Testing

- [ ] Smoke tests pass in staging environment
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Performance benchmarks acceptable
- [ ] Database backup tested and verified
- [ ] Rollback procedure documented and tested

### Monitoring & Observability

- [ ] Error tracking service configured (Sentry, etc.)
- [ ] Health check endpoint available
- [ ] Logging aggregation setup (CloudWatch, ELK, etc.)
- [ ] Performance monitoring configured
- [ ] Uptime monitoring configured
- [ ] Alert channels configured (email, Slack, etc.)

### Documentation

- [ ] Deployment runbook created and shared
- [ ] Rollback procedure documented
- [ ] Post-deployment verification steps documented
- [ ] Emergency contacts listed
- [ ] Known issues and limitations documented

## Production Environment Setup

### Creating Production Environment Variables

**Frontend (.env.production for build):**

```bash
# .env.production in frontend/
VITE_REGION=<your_production_region>
VITE_PROJECT=<your_production_project_uuid>
VITE_AGENT_ID=<your_production_agent_uuid>

# Optional
VITE_WORKFORCE_ID=<optional_workforce_id>
```

Build with production environment:

```bash
NODE_ENV=production npm run build:frontend
```

**Backend (.env or systemd envs for runtime):**

```bash
# .env in backend/ (or system environment)
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DATABASE_URL=./data/ltfc.json

# Optional: For database migration
# DATABASE_URL=postgres://user:pass@db.example.com:5432/ltfc
```

### Quick Production Deployment

#### Using Docker Compose (VPS/On-Premises)

1. **Create docker-compose.prod.yml:**

```yaml
version: "3.8"
services:
  api:
    image: api:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      LOG_LEVEL: info
    volumes:
      - ./data:/app/data
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
    depends_on:
      - api
    restart: always
```

1. **Deploy:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Using Heroku (Simple)

```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create match-day-itinerary

# 4. Add buildpacks
heroku buildpacks:add heroku/nodejs

# 5. Set environment variables
heroku config:set VITE_REGION=production_region
heroku config:set NODE_ENV=production

# 6. Deploy
git push heroku main
```

#### Using Vercel (Frontend Only)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy frontend
cd frontend
vercel --prod

# 3. Configure environment in Vercel dashboard
# Settings → Environment Variables → Add VITE_*
```

## Deployment Patterns

### Pattern 1: Separate Infrastructure (Recommended)

Deploy frontend and backend to independent services:

```diagram
┌─────────────────────────────────────────┐
│          Cloudflare CDN / S3             │
│        (Serves Frontend /dist/)          │
└────────────────────────────────────────┘
                    ↓
            API Requests (fetch)
                    ↓
┌─────────────────────────────────────────┐
│   Docker / Node.js Server                │
│  (Runs Backend /dist/index.js)           │
│   Port: 3000 (configurable)              │
└─────────────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │   sql.js Database     │
        │ (data/ltfc.json)      │
        └───────────────────────┘
```

**Benefits:**

- Independent scaling
- Frontend cacheable globally
- Backend auto-restarts work without re-serving frontend
- Easy rollback per service

### Pattern 2: Monolithic Deployment

Deploy both on same server (simpler for MVP):

```bash
# Build both
npm run build

# Copy frontend/dist to backend/public (or similar)
cp -r frontend/dist backend/public

# Start backend (serves frontend as static files)
node backend/dist/index.js
```

Backend can serve frontend via middleware:

```typescript
app.use(serveStatic("./public"));
```

**Benefits:**

- Single deployment unit
- Simpler infrastructure
- Lower hosting costs
- Good for monolithic Heroku/Render deployments

## Independent Scaling Options

### Frontend Scaling

**Option 1: CDN (Recommended for production):**

```bash
# Build frontend
npm run build:frontend

# Deploy frontend/dist to:
# - Cloudflare Pages
# - Vercel
# - Netlify
# - AWS CloudFront and S3
# - GitHub Pages
```

Configuration for Cloudflare Pages:

```toml
# wrangler.toml
name = "match-day-itinerary"
type = "javascript"

[build]
command = "npm install && npm run build:frontend"
cwd = "frontend"
upload.dir = "dist"
```

**Option 2: Static Web Server:**

```nginx
# nginx example
server {
    listen 80;
    server_name example.com;
    root /var/www/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://backend:3000;
    }
}
```

### Backend Scaling

**Option 1: Containerised (Docker):**

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/dist ./dist
COPY backend/data ./data

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Deploy with:

- Docker Compose (development)
- Kubernetes (large scale)
- AWS ECS / EKS
- Google Cloud Run
- Azure Container Instances

**Option 2: Serverless (Node.js)**
Not recommended for this project since sql.js needs file persistence, but possible with:

- AWS Lambda and EFS
- Google Cloud Functions and Firestore
- Vercel serverless functions (with database connection)

**Option 3: Traditional VPS:**

```bash
# SSH into server
ssh user@server.com

# Clone repo
git clone <repo> /app
cd /app

# Build and start
npm install
npm run build:backend

# Use process manager (PM2)
npx pm2 start "node backend/dist/index.js" --name api
```

### Database Scaling

Currently uses sql.js with JSON file persistence (`data/ltfc.json`).

**For larger deployments, migrate to:**

```typescript
// Option 1: PostgreSQL (recommended)
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Option 2: MongoDB
import { MongoClient } from "mongodb";

// Option 3: Supabase (PostgreSQL and features)
// Already has node SDK integration
```

## Example CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm install

      - name: Build frontend
        run: npm run build:frontend

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: match-day-itinerary
          directory: frontend/dist

  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm install

      - name: Build backend
        run: npm run build:backend

      - name: Build Docker image
        run: |
          docker build -f Dockerfile.backend -t $REGISTRY/$IMAGE_NAME:latest .
          docker tag $REGISTRY/$IMAGE_NAME:latest $REGISTRY/$IMAGE_NAME:${{ github.sha }}

      - name: Push to Container Registry
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login $REGISTRY -u ${{ github.actor }} --password-stdin
          docker push $REGISTRY/$IMAGE_NAME:latest
          docker push $REGISTRY/$IMAGE_NAME:${{ github.sha }}

      - name: Deploy to server
        run: |
          ssh deploy@api.example.com "cd /app && git pull && npm install && npm run build:backend && npx pm2 restart api"
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "22"
          cache: "npm"
      - run: npm install
      - run: npm run type-check -w frontend
      - run: npm run type-check -w backend

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "22"
          cache: "npm"
      - run: npm install
      - run: npm run lint
```

### Manual Deployment Steps

**For frontend:**

```bash
# 1. Build
npm run build:frontend

# 2. Upload to CDN (example: Cloudflare)
wrangler pages deploy frontend/dist

# 3. Invalidate cache
# (handle automatically by CDN or manually)
```

**For backend:**

```bash
# 1. Build
npm run build:backend

# 2. Create Docker image (if using Docker)
docker build -f Dockerfile.backend -t api:latest .

# 3. Push to registry
docker push registry.example.com/api:latest

# 4. Deploy (example: Docker Compose)
docker-compose pull api
docker-compose up -d api

# 5. Verify health
curl http://localhost:3000/health
```

## Environment Variables for Deployment

**Frontend (.env for build time):**

```dotenv
VITE_REGION=production_region
VITE_PROJECT=production_project_uuid
VITE_AGENT_ID=production_agent_uuid
```

**Backend (runtime environment):**

```dotenv
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DATABASE_URL=./data/ltfc.json
```

## Health Checks & Monitoring

### Frontend Health

```bash
# Check if serving
curl https://example.com

# Check response time
curl -w "Time: %{time_total}s\n" https://example.com
```

### Backend Health

```bash
# Add health endpoint to Hono
app.get("/health", (c) => c.json({ status: "ok" }));

# Monitor
curl http://api.example.com:3000/health
```

### Monitoring (Production)

Recommended services:

- **Error tracking**: Sentry, Rollbar
- **Performance**: New Relic, DataDog, Grafana
- **Uptime**: Pingdom, UptimeRobot
- **Logs**: CloudWatch, ELK Stack, Loki

```typescript
// Sentry integration (Optional)
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

## Rollback Strategy

### Frontend Rollback

```bash
# CDN-based: point DNS/origin to previous build
# Git-based: redeploy previous commit
git revert HEAD
npm run build:frontend
wrangler pages deploy frontend/dist
```

### Backend Rollback

```bash
# Docker: use previous image tag
docker-compose pull api:v1.2.3
docker-compose up -d api

# Or: restart previous version
pm2 restart api --version 1.2.3
```

## Database Backup & Recovery

### Backup Procedure

```bash
# Backup sql.js JSON
cp data/ltfc.json data/ltfc.json.backup.$(date +%Y%m%d)

# Upload to S3/cloud storage
aws s3 cp data/ltfc.json s3://backups/ltfc.json
```

### Recovery Procedure

```bash
# Restore from backup
aws s3 cp s3://backups/ltfc.json data/ltfc.json

# Restart backend
npm run build:backend
pm2 restart api
```

## Security Checklist

- [ ] Use HTTPS/TLS for all connections
- [ ] Set environment variables securely (not in repo)
- [ ] Enable CORS only for trusted origins
- [ ] Validate all API inputs
- [ ] Use authentication tokens (JWT, OAuth)
- [ ] Rate limit API endpoints
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Use secrets management (GitHub Secrets, Vault)
- [ ] Enable database encryption at rest
- [ ] Monitor and log all production errors

## Summary

| Aspect         | Setup                                          |
| -------------- | ---------------------------------------------- |
| **Frontend**   | Build → CDN (Cloudflare/Vercel/Netlify)        |
| **Backend**    | Build → Docker → Kubernetes/VPS/Serverless     |
| **Database**   | sql.js (development) → PostgreSQL (production) |
| **CI/CD**      | GitHub Actions (auto-deploy on push)           |
| **Monitoring** | Error tracking and health checks               |
| **Backup**     | Automated snapshots to cloud storage           |
