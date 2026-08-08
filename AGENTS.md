# Dr. Arifur Rahman Portfolio & CMS — Agent Guide

## Two independent Node projects (no monorepo tool)
- Root `package.json` — React frontend (Vite 5 + React 18 + Tailwind CSS 3 + daisyUI 5)
- `server/package.json` — Express + Mongoose backend (ESM, `"type": "module"`)

## Commands

### Frontend (root)
| Command | Action |
|---------|--------|
| `npm run dev` | Start Vite dev server (`--host 0.0.0.0`) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

### Backend (`server/`)
| Command | Action |
|---------|--------|
| `npm start` | `node index.js` |
| `npm run dev` | `node --watch index.js` |

No test, lint, or typecheck scripts exist.

## Architecture

- **Auth**: Simple email/password (no JWT). Login stores `{ email, role: "admin" }` in `localStorage` under key `mockUser`. Auth state communicates via custom `window.dispatchEvent(new Event("auth-change"))`.
- **API client**: `src/lib/cms.js` — thin `fetch` wrapper. Transforms `_id` → `id` automatically.
- **ImgBB**: Hardcoded API key (`81d3a84c4355522a5772250fb757fe39`) in `src/lib/cms.js:111` for image uploads.
- **Env**: `VITE_API_BASE_URL` (falls back to `https://drariful-cms-backend.vercel.app/api`). See `.env.example`.
- **Import alias**: `@/` → `src/` (Vite resolve alias).

## Routing
- React Router v7 (`createBrowserRouter`). Routes defined in `src/App.jsx`.
- SPA fallback via `public/_redirects` (`/* /index.html 200`) for Netlify.

## Deployment
- **Frontend** → Netlify: build command `npm run build`, publish dir `dist`.
- **Backend** → Vercel: deploy `server/` folder, uses `server/vercel.json` config.
- Backend uses `mongoose.models.X || mongoose.model(...)` pattern to prevent model redefinition on Vercel's serverless cold starts.

## Notable conventions
- `server/index.js` has a `connectDB()` function that caches the DB connection (checked via `mongoose.connection.readyState`) for Vercel performance.
- CSS utility `cn()` from `src/lib/utils.js` (clsx + tailwind-merge).
- No CSS modules or CSS-in-JS — global `index.css` + Tailwind utility classes.
