# AI Website Generator for small Indian businesses

Card-based, no-prompt website builder. See the MVP spec for the full plan.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Supabase keys.
3. In the Supabase SQL editor, run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
4. In Supabase → Authentication → URL Configuration, add `http://localhost:3000/auth/callback` to the redirect URLs.
5. `npm run dev`

The template gallery (`/templates`) works without any keys.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the app |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm run check:samples` | Validate every sample against every template's slot schema |
| `npm run db:seed-sql` | Regenerate `supabase/seed.sql` from the template code |

## How templates work

Each template in `templates/<id>/` declares its content slots in `schema.ts` using the helpers in `lib/slots.ts`
(`text(maxWords)`, `group`, `list`). That one declaration produces both the schema sent to the model and the validator
applied to its JSON (word limits, no HTML). `index.tsx` holds the layout, fonts and image slots.
Colours come from `lib/palettes.ts` as CSS variables, so a palette never changes a layout.
