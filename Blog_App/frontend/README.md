# BlogApp — Frontend

React + Vite + TypeScript + Tailwind CSS.

## Setup

```bash
cd frontend
npm install       # or bun install
cp .env.example .env
npm run dev        # or bun run dev
```

Runs on `http://localhost:5173` and talks to the backend at the URL set in
`VITE_API_URL` (defaults to `http://localhost:4000`).

## Structure

```
src/
  api/client.ts          # axios instance, auto-attaches JWT from localStorage
  context/AuthContext.tsx # global auth state (user, login, register, logout)
  components/
    Navbar.tsx
    ProtectedRoute.tsx     # redirects to /login (or /) if not allowed
  pages/
    Login.tsx / Register.tsx
    Posts.tsx               # home feed
    PostDetail.tsx           # single post + comments
    CreatePost.tsx            # category select + many-to-many tag picker
    Profile.tsx                 # view/edit own 1:1 profile
    AdminUsers.tsx                # admin-only user list
  App.tsx                          # routes
  main.tsx                          # entrypoint
```

## How auth works on the frontend

1. `login()`/`register()` in `AuthContext` call the backend, get back
   `{ token, user }`, and save both to `localStorage`.
2. `api/client.ts`'s axios interceptor reads the token from `localStorage`
   on every request and sets `Authorization: Bearer <token>`.
3. `ProtectedRoute` reads `user` from context; if it's `null` it redirects to
   `/login`. Pass `adminOnly` to also require `role === "admin"`.
4. A 401 response from the API (expired/invalid token) automatically clears
   the stored session via the response interceptor.
