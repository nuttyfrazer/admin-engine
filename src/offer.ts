// Brand-agnostic offer engine. `evaluateOffers` is a pure function with no
// Supabase or DOM dependency, so the SAME logic drives the authoritative
// discount at checkout (server) and the "add one more" nudges in the basket
// (client). Coded discounts stay in promo_codes; these are automatic,
// basket-building mechanics.

export type OfferType = "quantity_pct" | "bundle_xgy" | "spend_gift"

export type Offer = {
  id: string
  name: string
  type: OfferType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>
  category: string | null
  active?: boolean
  starts_at?: string | null
  ends_at?: string | null
  priority?: number
}

export type OfferCartItem = {
  slug: string
  license: "personal" | "commercial"
  price: number
  categories?: string[]
}

export type OfferGift = { slug: string; license: "personal" | "commercial" }

export type OfferResult = {
  discount: number
  gifts: OfferGift[]
  applied: { name: string; type: OfferType; saved: number }[]
  hints: { name: string; message: string }[]
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function offerIsLive(o: Offer, now: Date = new Date()): boolean {
  if (o.active === false) return false
  if (o.starts_at && new Date(o.starts_at) > now) return false
  if (o.ends_at && new Date(o.ends_at) < now) return false
  return true
}

function inScope(item: OfferCartItem, category: string | null): boolean {
  if (!category) return true
  return !!item.categories?.includes(category)
}

const scopeLabel = (category: string | null) => (category ? `${category} ` : "")

export function evaluateOffers(
  items: OfferCartItem[],
  offers: Offer[],
  now: Date = new Date(),
): OfferResult {
  const result: OfferResult = { discount: 0, gifts: [], applied: [], hints: [] }
  const live = offers.filter(o => offerIsLive(o, now)).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))

  for (const offer of live) {
    const eligible = items.filter(i => inScope(i, offer.category))

    if (offer.type === "quantity_pct") {
      const minQty = Number(offer.config.min_qty) || 0
      const percent = Number(offer.config.percent) || 0
      if (minQty <= 0 || percent <= 0) continue
      if (eligible.length >= minQty) {
        const sub = eligible.reduce((s, i) => s + i.price, 0)
        const saved = round2(sub * (percent / 100))
        if (saved > 0) { result.discount += saved; result.applied.push({ name: offer.name, type: offer.type, saved }) }
      } else if (eligible.length > 0) {
        const need = minQty - eligible.length
        result.hints.push({ name: offer.name, message: `Add ${need} more ${scopeLabel(offer.category)}design${need > 1 ? "s" : ""} to get ${percent}% off` })
      }
    }

    else if (offer.type === "bundle_xgy") {
      const buy = Number(offer.config.buy) || 0
      const free = Number(offer.config.free) || 0
      const groupSize = buy + free
      if (buy <= 0 || free <= 0) continue
      const sorted = [...eligible].sort((a, b) => a.price - b.price) // cheapest become free
      const numGroups = Math.floor(sorted.length / groupSize)
      const freeCount = numGroups * free
      if (freeCount > 0) {
        const saved = round2(sorted.slice(0, freeCount).reduce((s, i) => s + i.price, 0))
        if (saved > 0) { result.discount += saved; result.applied.push({ name: offer.name, type: offer.type, saved }) }
      } else if (eligible.length >= buy) {
        const need = groupSize - eligible.length
        result.hints.push({ name: offer.name, message: `Add ${need} more to get ${free} free` })
      }
    }

    else if (offer.type === "spend_gift") {
      const minSpend = Number(offer.config.min_spend) || 0
      const giftSlug = String(offer.config.gift_slug || "")
      if (minSpend <= 0 || !giftSlug) continue
      const base = eligible.reduce((s, i) => s + i.price, 0)
      if (base >= minSpend) {
        if (!result.gifts.some(g => g.slug === giftSlug)) {
          result.gifts.push({ slug: giftSlug, license: "personal" })
          result.applied.push({ name: offer.name, type: offer.type, saved: 0 })
        }
      } else {
        result.hints.push({ name: offer.name, message: `Spend £${(minSpend - base).toFixed(2)} more for a free gift` })
      }
    }
  }

  // Never discount below zero across combined offers.
  const subtotal = items.reduce((s, i) => s + i.price, 0)
  if (result.discount > subtotal) result.discount = subtotal
  result.discount = round2(result.discount)
  return result
}

// Validation for the admin editor. Returns human-readable problems.
export function validateOffer(o: Partial<Offer>): string[] {
  const errors: string[] = []
  if (!o.name?.trim()) errors.push("Give the offer a name.")
  const c = o.config ?? {}
  if (o.type === "quantity_pct") {
    if (!(Number(c.min_qty) > 0)) errors.push("Set a minimum quantity.")
    if (!(Number(c.percent) > 0 && Number(c.percent) <= 100)) errors.push("Set a percent between 1 and 100.")
  } else if (o.type === "bundle_xgy") {
    if (!(Number(c.buy) > 0)) errors.push("Set how many must be bought.")
    if (!(Number(c.free) > 0)) errors.push("Set how many are free.")
  } else if (o.type === "spend_gift") {
    if (!(Number(c.min_spend) > 0)) errors.push("Set a minimum spend.")
    if (!String(c.gift_slug || "").trim()) errors.push("Choose the gift product (slug).")
  } else {
    errors.push("Pick an offer type.")
  }
  return errors
}
