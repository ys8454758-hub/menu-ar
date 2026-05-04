export interface Dish {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    slug: string;
    category: string | null;
    model: { id: string } | null;
    badges: { type: string }[];
}

export interface Restaurant {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    bannerUrl?: string | null;
    menuQrUrl?: string | null;
    address?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    dishes?: Dish[];
    menuTheme?: { themeName: string } | null;
    subscription?: { plan: string; status: string } | null;
}
