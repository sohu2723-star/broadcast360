# Broadcast360

Broadcast360 contains two Next.js applications: the **backend/admin application** on port `3000` and the **user portal** on port `3001`. The backend also owns the Prisma schema and communicates with MediaMTX for streaming.

## Localhost setup

Install Node.js 22 or newer, PostgreSQL, FFmpeg, and MediaMTX. Create a database named `broadcast360`, then copy the environment templates and replace the placeholder values:

```bash
cd broadcast360/broadcast360
cp .env.example .env
npm ci
npm run db:validate
npm run db:deploy
npm run dev
```

The backend is available at [http://localhost:3000](http://localhost:3000). In another terminal, start the user portal:

```bash
cd broadcast360/user-portal
cp .env.example .env.local
npm ci
npm run dev
```

The user portal is available at [http://localhost:3001](http://localhost:3001). The backend environment uses `USER_PORTAL_ORIGIN=http://localhost:3001`, and the portal uses `NEXT_PUBLIC_API_URL=http://localhost:3000` by default.

MediaMTX must be running separately for stream ingest and playback. Use `mediamtx/mediamtx.yml` as the starting configuration and keep its management API restricted to the private host or internal network.

## Production deployment

Run the backend and user portal as separate long-running Node processes behind a reverse proxy. Set `NODE_ENV=production`, use strong distinct values for `JWT_SECRET` and `JWT_SECRET_USER`, configure a production `DATABASE_URL`, and set `USER_PORTAL_ORIGIN` and `NEXT_PUBLIC_API_URL` to the public HTTPS origins.

Build and start the backend:

```bash
cd broadcast360/broadcast360
npm ci
npm run db:validate
npm run db:deploy
npm run build
NODE_ENV=production PORT=3000 npm run start
```

Build and start the user portal:

```bash
cd broadcast360/user-portal
npm ci
NEXT_PUBLIC_API_URL=https://api.example.com npm run build
NODE_ENV=production PORT=3001 npm run start
```

The start scripts accept the `PORT` environment variable, so the same commands work on localhost, a VM, or a container. The build scripts automatically regenerate the Prisma client before compiling the backend.

## Useful checks

```bash
# Backend
cd broadcast360/broadcast360
npm run db:validate
npm run typecheck
npm run lint
npm run build

# User portal
cd broadcast360/user-portal
npm run typecheck
npm run lint
npm run build
```

Do not commit `.env`, `.env.local`, database credentials, JWT secrets, uploaded media, or production MediaMTX credentials. Use a process supervisor such as systemd, PM2, or a container orchestrator for production restarts and logs.
