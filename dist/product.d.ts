import type { SupabaseLike } from "./blog";
export declare const HOOP_SIZES: readonly ["4x4", "5x7", "8x8", "8x10"];
export type HoopSize = (typeof HOOP_SIZES)[number];
export declare const EMBROIDERY_FORMATS: readonly ["DST", "PES", "JEF", "EXP", "VP3", "XXX", "PDF", "JPEG", "ZIP"];
export type ProductSize = {
    hoop: string;
    stitch_count?: number | null;
    colour_changes?: number | null;
    width_mm?: number | null;
    height_mm?: number | null;
};
export type ProductListItem = {
    id: string;
    slug: string;
    name: string;
    price: number;
    categories: string[];
    active: boolean;
    is_featured: boolean;
    preview_images: string[];
    download_count: number;
    created_at: string | null;
};
export type ProductInput = {
    name?: string;
    slug?: string;
    short_description?: string | null;
    description?: string | null;
    personal_use_price?: number | null;
    commercial_use_price?: number | null;
    has_commercial_option?: boolean;
    categories?: string[];
    sizes?: ProductSize[];
    formats?: string[];
    preview_images?: string[];
    design_count?: number;
    is_new?: boolean;
    is_featured?: boolean;
    is_bestseller?: boolean;
    active?: boolean;
    seo_title?: string | null;
    seo_description?: string | null;
};
export declare function productInputToColumns(input: ProductInput): Record<string, any>;
export declare function validateProduct(input: ProductInput): string[];
export declare function slugify(name: string): string;
export declare function listProducts(db: SupabaseLike): Promise<ProductListItem[]>;
export declare function getProductById(db: SupabaseLike, id: string): Promise<any>;
export declare function createProduct(db: SupabaseLike, input: ProductInput): Promise<{
    id: string;
}>;
export declare function updateProduct(db: SupabaseLike, id: string, input: ProductInput): Promise<{
    id: string;
}>;
