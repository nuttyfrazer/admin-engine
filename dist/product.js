// Brand-agnostic embroidery-product engine. Like the blog engine, every
// function receives a Supabase client from the host (service-role for admin
// writes, anon for public reads) so the same logic can drive the master admin
// (writing to either brand) and each public site (reading its own brand).
//
// This module owns the *shape* and *validation* of an embroidery product; the
// host owns Storage uploads (design files + preview images) because bucket
// names and env are host-specific.
// Hoop sizes we digitise for (tickable per product). One price per pattern
// includes every size that's ticked, delivered in a single download.
export const HOOP_SIZES = ["4x4", "5x7", "8x8", "8x10"];
// Machine + document formats a product's files may include.
export const EMBROIDERY_FORMATS = ["DST", "PES", "JEF", "EXP", "VP3", "XXX", "PDF", "JPEG", "ZIP"];
const LIST_COLUMNS = "id, slug, name, price, categories, active, is_featured, preview_images, download_count, created_at";
/* eslint-disable @typescript-eslint/no-explicit-any */
// Map the editor payload to DB columns. `price` mirrors the personal price so
// the existing (non-null) `price` column and legacy readers stay correct, and
// `category` mirrors categories[0] for back-compat with older single-category
// reads. Only defined keys are written, so this is safe for partial updates.
export function productInputToColumns(input) {
    const cols = {};
    const set = (k, v) => { if (v !== undefined)
        cols[k] = v; };
    set("name", input.name);
    set("slug", input.slug);
    set("short_description", input.short_description);
    set("description", input.description);
    set("personal_use_price", input.personal_use_price);
    set("commercial_use_price", input.commercial_use_price);
    set("has_commercial_option", input.has_commercial_option);
    set("categories", input.categories);
    set("sizes", input.sizes);
    set("formats", input.formats);
    set("preview_images", input.preview_images);
    set("design_count", input.design_count);
    set("is_new", input.is_new);
    set("is_featured", input.is_featured);
    set("is_bestseller", input.is_bestseller);
    set("active", input.active);
    set("seo_title", input.seo_title);
    set("seo_description", input.seo_description);
    // Derived / back-compat columns.
    if (input.personal_use_price !== undefined && input.personal_use_price !== null) {
        cols.price = input.personal_use_price;
    }
    if (input.categories !== undefined) {
        cols.category = input.categories[0] ?? null;
    }
    cols.updated_at = new Date().toISOString();
    return cols;
}
// Validation shared by every host. Returns a list of human-readable problems;
// empty means OK.
export function validateProduct(input) {
    const errors = [];
    if (!input.name?.trim())
        errors.push("Name is required.");
    if (!input.slug?.trim())
        errors.push("Slug is required.");
    else if (!/^[a-z0-9-]+$/.test(input.slug))
        errors.push("Slug may only contain lowercase letters, numbers and hyphens.");
    if (input.personal_use_price == null || Number(input.personal_use_price) <= 0) {
        errors.push("A personal-use price is required.");
    }
    if (input.has_commercial_option && (input.commercial_use_price == null || Number(input.commercial_use_price) <= 0)) {
        errors.push("A commercial-use price is required when the commercial option is enabled.");
    }
    if (!input.categories?.length)
        errors.push("Pick at least one category.");
    if (!input.preview_images || input.preview_images.length < 2) {
        errors.push("Add at least two display images (e.g. the digital render and a stitched-out photo).");
    }
    return errors;
}
export function slugify(name) {
    return name.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
// ── Repository (host injects the Supabase client) ────────────
export async function listProducts(db) {
    const { data, error } = await db.from("products")
        .select(LIST_COLUMNS).order("created_at", { ascending: false });
    if (error)
        throw error;
    return (data ?? []);
}
export async function getProductById(db, id) {
    const { data, error } = await db.from("products").select("*").eq("id", id).single();
    if (error)
        throw error;
    return data;
}
export async function createProduct(db, input) {
    const cols = productInputToColumns(input);
    const { data, error } = await db.from("products").insert(cols).select("id").single();
    if (error)
        throw error;
    return data;
}
export async function updateProduct(db, id, input) {
    const cols = productInputToColumns(input);
    const { data, error } = await db.from("products").update(cols).eq("id", id).select("id").single();
    if (error)
        throw error;
    return data;
}
