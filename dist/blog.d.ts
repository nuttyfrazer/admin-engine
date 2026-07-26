export interface SupabaseLike {
    from(table: string): any;
}
export type BlogStatus = "draft" | "published" | "archived";
export type BlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    body: string | null;
    coverImage: string | null;
    author: string;
    category: string | null;
    tags: string[];
    status: BlogStatus;
    publishedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    readTime: string | null;
    views: number;
    seoTitle: string | null;
    seoDescription: string | null;
};
export type BlogListItem = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    category: string | null;
    status: BlogStatus;
    publishedAt: string | null;
    createdAt: string | null;
    views: number;
    coverImage: string | null;
};
export type BlogPostInput = {
    title?: string;
    slug?: string;
    excerpt?: string | null;
    body?: string | null;
    category?: string | null;
    tags?: string[];
    coverImage?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    status?: BlogStatus;
    author?: string;
};
export declare function listPosts(db: SupabaseLike): Promise<BlogListItem[]>;
export declare function getPostById(db: SupabaseLike, id: string): Promise<BlogPost | null>;
export declare function createPost(db: SupabaseLike, input: BlogPostInput): Promise<BlogPost>;
export declare function updatePost(db: SupabaseLike, id: string, input: BlogPostInput): Promise<BlogPost>;
export declare function deletePost(db: SupabaseLike, id: string): Promise<void>;
export declare function getPublishedPosts(db: SupabaseLike): Promise<BlogPost[]>;
export declare function getPublishedPostBySlug(db: SupabaseLike, slug: string): Promise<BlogPost | null>;
export declare function getPublishedSlugs(db: SupabaseLike): Promise<string[]>;
