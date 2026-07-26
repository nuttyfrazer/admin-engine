export type BrandKey = "nutty" | "witty";
export declare const BRAND_KEYS: BrandKey[];
export type BrandMeta = {
    key: BrandKey;
    label: string;
    shortLabel: string;
    domain: string;
};
export declare const BRAND_META: Record<BrandKey, BrandMeta>;
export declare function isBrandKey(value: string | undefined | null): value is BrandKey;
export declare function toBrandKey(value: string | undefined | null): BrandKey;
