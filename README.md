# @retail/admin-engine

Shared, brand-agnostic retail admin engine for **The Nutty Squirrel** and **The Witty Badger**.

The two storefronts stay completely separate; this package is the shared *backend logic* so the admin engine (blog, product) isn't built twice. It is currently consumed by:

- **Nutty's master admin** — writes to *either* brand's Supabase project via a brand switcher.
- **Each public site** — reads its own brand's published content.

## Design rules

- **No secrets, no env here.** Every function receives a Supabase client from the host. The host maps `brand → { url, service-role key, storage bucket }` (see the master admin's `src/lib/brands.ts`).
- **Stateless.** Admin functions take a service-role client; public read functions take an anon client and never throw (return `[]`/`null` on failure).
- Ships **TypeScript source** — consumers must add this package to `transpilePackages` in `next.config.ts`.

## Install (local dev)

```jsonc
// host package.json
"@retail/admin-engine": "file:../admin-engine"
```

```ts
// next.config.ts
transpilePackages: ["@retail/admin-engine"]
```

Graduate to a private Git repo (`nuttyfrazer/admin-engine`) + tagged installs (`github:nuttyfrazer/admin-engine#v0.1.0`) once stable.

## Exports

- `brands` — `BrandKey`, `BRAND_META`, `isBrandKey`, `toBrandKey`
- `blog` — `BlogPost`, `BlogPostInput`, and repo fns: `listPosts`, `getPostById`, `createPost`, `updatePost`, `deletePost`, `getPublishedPosts`, `getPublishedPostBySlug`, `getPublishedSlugs`

## Roadmap

- `products/` — shared product engine with a per-brand schema adapter (Nutty = physical, Witty = digital).
- `media/` — shared image-upload helpers.
