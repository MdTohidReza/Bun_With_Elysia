# BlogApp — Full Stack Portfolio Project

A complete blog platform built to demonstrate real-world backend engineering
skills: authentication, role-based access control, and every kind of
relational database relationship, using a modern JS/TS stack.

**Stack:** React + Vite (frontend) · Bun + Elysia + Drizzle ORM + PostgreSQL (backend)

## What this project demonstrates

- **JWT authentication**: register, login, logout, protected `/me` route
- **Role-based access control**: `user` vs `admin`, plus resource-ownership checks
  (a user can only edit/delete their own posts and comments; admins can manage everything)
- **Every Drizzle relation type**, all in one schema:
  - **One-to-one** → `users` ↔ `profiles`
  - **One-to-many** → `users` → `posts`, `categories` → `posts`, `posts` → `comments`
  - **Many-to-many** → `posts` ↔ `tags` (through the `posts_to_tags` join table)
- **Elysia's built-in OpenAPI/Swagger docs** — auto-generated interactive API
  documentation at `/docs`, driven entirely by the typebox validation schemas
- **Clean layered architecture** per module: `model` (validation) →
  `service` (database) → `controller` (HTTP routes)
- **A working React frontend** consuming the API: auth pages, post feed, post
  detail with comments, create-post form with a category dropdown and a
  many-to-many tag picker, editable profile, and an admin user-management page

## Quick start

```bash
# 1. Backend
cd backend
cp .env.example .env      # point DATABASE_URL at your Postgres instance
bun install
bun run db:generate
bun run db:migrate
bun run db:seed           # optional demo data
bun run dev                # http://localhost:4000  (docs at /docs)

# 2. Frontend (in a second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

See `backend/README.md` and `frontend/README.md` for full details, and
`NEPALI_EXPLANATION.md` for a walkthrough of the backend request flow in Nepali.
