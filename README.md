# TradeBase SG

A hawker procurement network for Singapore.

## What it does
- Hawker login with Supabase Auth magic links
- Claim a TradeBase ID and stall profile
- Post supply requests
- Create and join group buys
- Browse suppliers and network stalls

## Stack
- Next.js App Router
- Supabase Auth + Postgres
- Row Level Security for data isolation
- Deployed on Vercel

## Local setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql` to preload sample suppliers.
4. Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Install and run:

```bash
npm install
npm run dev
```

## Supabase Auth settings
In the Supabase dashboard, add these redirect URLs:
- `http://localhost:3000/auth/callback`
- `https://your-vercel-domain.vercel.app/auth/callback`

## Vercel deployment
1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Add the same environment variables in Vercel Project Settings.
4. Deploy.

## Notes
- The app uses row-level security so users can only mutate their own records.
- The suppliers table is read-only for signed-in users.
- The seed data is demo data. Replace it with real supplier relationships once you have them.
