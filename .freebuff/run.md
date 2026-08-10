# Run doc — duitku (Next.js 16)

## Reproduce the uncommitted artifacts

- Dependencies: `npm ci` (uses `package-lock.json`). Already installed in this checkout.
- Env: copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase Dashboard → Project Settings → API). The app also runs fine without `.env.local` — `middleware.ts` skips auth protection and pages render when Supabase is not configured — so this step is only needed for real auth/data.

## Run the server

```bash
npm run dev
```

Serves on http://localhost:3000 by default (Next.js default port).

If port 3000 is taken (e.g. another dev server), pick a free port:

```bash
npm run dev -- -p 3001
```

Serves on http://localhost:3001. Preview registration uses whichever port the server actually answers on.
