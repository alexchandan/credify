<!-- use markdown preview extension or tools for better experience-->

# Environment Setup

## Prerequisites

- Node.js 20+
- npm 10+
- A MongoDB Atlas account (free M0 tier is fine for development)
- Git

## 1. Clone and install

```bash
git clone <repo-url> credify
cd credify
```

If using workspaces (recommended — see root `package.json`):

```bash
npm install   # installs backend, frontend, and packages/shared dependencies together
```

Otherwise, install each separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 2. Set up MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. Create **two databases** on it (or two separate clusters if you prefer full isolation): `credify_dev` and `credify_prod`. Never develop against the same database you intend to launch with.
3. Under Database Access, create a user with read/write permissions.
4. Under Network Access, allow your current IP (or `0.0.0.0/0` for local development only — never in production).
5. Copy the connection string — you'll need it for `MONGODB_URI` below.

## 3. Configure environment variables

### Backend

```bash
cd backend
cp .env.example .env
```

Fill in:

```
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/credify_dev
JWT_ACCESS_SECRET=<generate a long random string>
JWT_REFRESH_SECRET=<generate a different long random string>
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run it twice — access and refresh secrets must be different values.

### Frontend

```bash
cd frontend
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

## 4. Run the project

Backend:

```bash
cd backend
npm run dev
```

Visit `http://localhost:5000/health` — should return `{ "success": true, "data": { "status": "ok", ... } }`.

Frontend:

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`.

## 5. Verify the database connection

If the backend logs `Connected to MongoDB` on startup and `/health` responds, the connection is working. If it hangs or errors:

- Double-check the Network Access IP allowlist in Atlas.
- Confirm the password in `MONGODB_URI` doesn't contain unescaped special characters (URL-encode them if it does).

## Common Issues

| Symptom                                                               | Likely cause                                                                           |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Server exits immediately with "Missing required environment variable" | One of `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` is missing from `.env` |
| CORS error in browser console                                         | `CLIENT_ORIGIN` in backend `.env` doesn't match the frontend's actual URL/port         |
| Mongo connection times out                                            | IP not allowlisted in Atlas Network Access                                             |
