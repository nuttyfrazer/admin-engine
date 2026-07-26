// Brand identity shared across both retail sites. This is *identity only* —
// the mapping from a brand to its Supabase connection/env lives in the host
// (see the master admin's `lib/brands.ts`), because env var names are
// host-specific and secrets must never live in this package.

export type BrandKey = "nutty" | "witty"

export const BRAND_KEYS: BrandKey[] = ["nutty", "witty"]

export type BrandMeta = {
  key: BrandKey
  label: string
  shortLabel: string
  domain: string
}

export const BRAND_META: Record<BrandKey, BrandMeta> = {
  nutty: { key: "nutty", label: "The Nutty Squirrel", shortLabel: "Nutty", domain: "thenuttysquirrel.co.uk" },
  witty: { key: "witty", label: "The Witty Badger",   shortLabel: "Witty", domain: "wittybadger.co.uk" },
}

export function isBrandKey(value: string | undefined | null): value is BrandKey {
  return value === "nutty" || value === "witty"
}

// Coerce arbitrary input to a valid brand, defaulting to the master brand.
export function toBrandKey(value: string | undefined | null): BrandKey {
  return isBrandKey(value) ? value : "nutty"
}
