// Brand-agnostic blog engine. Every function receives a Supabase client from
// the host (service-role for admin writes, anon for public reads) so the same
// code drives the master admin (writing to either brand) and each public site
// (reading its own brand).
const FULL_COLUMNS = "id, slug, title, excerpt, body, cover_image, author, category, tags, status, published_at, created_at, updated_at, read_time, views, seo_title, seo_description";
const LIST_COLUMNS = "id, slug, title, excerpt, category, status, published_at, created_at, views, cover_image";
/* eslint-disable @typescript-eslint/no-explicit-any */
function mapPost(p) {
    return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt ?? null,
        body: p.body ?? null,
        coverImage: p.cover_image ?? null,
        author: p.author ?? "Sarah",
        category: p.category ?? null,
        tags: p.tags ?? [],
        status: (p.status ?? "draft"),
        publishedAt: p.published_at ?? null,
        createdAt: p.created_at ?? null,
        updatedAt: p.updated_at ?? null,
        readTime: p.read_time ?? null,
        views: p.views ?? 0,
        seoTitle: p.seo_title ?? null,
        seoDescription: p.seo_description ?? null,
    };
}
function mapListItem(p) {
    return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt ?? null,
        category: p.category ?? null,
        status: (p.status ?? "draft"),
        publishedAt: p.published_at ?? null,
        createdAt: p.created_at ?? null,
        views: p.views ?? 0,
        coverImage: p.cover_image ?? null,
    };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
function toRow(input) {
    const row = {};
    if (input.title !== undefined)
        row.title = input.title;
    if (input.slug !== undefined)
        row.slug = input.slug;
    if (input.excerpt !== undefined)
        row.excerpt = input.excerpt;
    if (input.body !== undefined)
        row.body = input.body;
    if (input.category !== undefined)
        row.category = input.category;
    if (input.tags !== undefined)
        row.tags = input.tags;
    if (input.coverImage !== undefined)
        row.cover_image = input.coverImage;
    if (input.metaTitle !== undefined)
        row.seo_title = input.metaTitle;
    if (input.metaDescription !== undefined)
        row.seo_description = input.metaDescription;
    if (input.author !== undefined)
        row.author = input.author;
    if (input.status !== undefined)
        row.status = input.status;
    return row;
}
// ── Admin (service-role client) ──────────────────────────────
export async function listPosts(db) {
    const { data, error } = await db
        .from("blog_posts")
        .select(LIST_COLUMNS)
        .order("created_at", { ascending: false });
    if (error)
        throw error;
    return (data ?? []).map(mapListItem);
}
export async function getPostById(db, id) {
    const { data, error } = await db.from("blog_posts").select(FULL_COLUMNS).eq("id", id).single();
    if (error)
        throw error;
    return data ? mapPost(data) : null;
}
export async function createPost(db, input) {
    const row = toRow(input);
    row.author = input.author ?? "Sarah";
    if (input.status === "published")
        row.published_at = new Date().toISOString();
    const { data, error } = await db.from("blog_posts").insert(row).select(FULL_COLUMNS).single();
    if (error)
        throw error;
    return mapPost(data);
}
export async function updatePost(db, id, input) {
    const row = toRow(input);
    row.updated_at = new Date().toISOString();
    // First publish stamps published_at; leave it once set.
    if (input.status === "published") {
        const { data: existing } = await db.from("blog_posts").select("published_at").eq("id", id).single();
        if (!existing?.published_at)
            row.published_at = new Date().toISOString();
    }
    const { data, error } = await db.from("blog_posts").update(row).eq("id", id).select(FULL_COLUMNS).single();
    if (error)
        throw error;
    return mapPost(data);
}
export async function deletePost(db, id) {
    const { error } = await db.from("blog_posts").delete().eq("id", id);
    if (error)
        throw error;
}
// ── Public (anon client + RLS) — resilient, never throws ─────
export async function getPublishedPosts(db) {
    try {
        const { data, error } = await db
            .from("blog_posts")
            .select(FULL_COLUMNS)
            .eq("status", "published")
            .order("published_at", { ascending: false });
        if (error || !data)
            return [];
        return data.map(mapPost);
    }
    catch {
        return [];
    }
}
export async function getPublishedPostBySlug(db, slug) {
    try {
        const { data, error } = await db
            .from("blog_posts")
            .select(FULL_COLUMNS)
            .eq("slug", slug)
            .eq("status", "published")
            .single();
        if (error || !data)
            return null;
        return mapPost(data);
    }
    catch {
        return null;
    }
}
export async function getPublishedSlugs(db) {
    try {
        const { data } = await db.from("blog_posts").select("slug").eq("status", "published");
        return (data ?? []).map((r) => r.slug);
    }
    catch {
        return [];
    }
}
