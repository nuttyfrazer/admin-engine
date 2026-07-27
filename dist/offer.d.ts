export type OfferType = "quantity_pct" | "bundle_xgy" | "spend_gift";
export type Offer = {
    id: string;
    name: string;
    type: OfferType;
    config: Record<string, any>;
    category: string | null;
    active?: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
    priority?: number;
};
export type OfferCartItem = {
    slug: string;
    license: "personal" | "commercial";
    price: number;
    categories?: string[];
};
export type OfferGift = {
    slug: string;
    license: "personal" | "commercial";
};
export type OfferResult = {
    discount: number;
    gifts: OfferGift[];
    applied: {
        name: string;
        type: OfferType;
        saved: number;
    }[];
    hints: {
        name: string;
        message: string;
    }[];
};
export declare function offerIsLive(o: Offer, now?: Date): boolean;
export declare function evaluateOffers(items: OfferCartItem[], offers: Offer[], now?: Date): OfferResult;
export declare function validateOffer(o: Partial<Offer>): string[];
