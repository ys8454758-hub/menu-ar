 export type CardSize = "a4" | "10cm";

export interface PDFCardOptions {
    restaurantName: string;
    restaurantLogoUrl?: string;
    dishName: string;
    dishDescription?: string;
    qrCodeUrl: string;
    size: CardSize;
    primaryColor?: string;
    secondaryColor?: string;
    showTagline?: boolean;
    tagline?: string;
}

export interface BulkPDFCard {
    restaurantName: string;
    dishName: string;
    dishDescription?: string;
    qrCodeUrl: string;
}

export interface PDFResult {
    buffer: Buffer;
    filename: string;
    contentType: string;
}

const DEFAULT_PRIMARY = "#00ff88";
const DEFAULT_SECONDARY = "#0a0a0a";
const DEFAULT_TAGLINE = "Scan to see in 3D";

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "\x26amp;")
        .replace(/</g, "\x26lt;")
        .replace(/>/g, "\x26gt;")
        .replace(/"/g, "\x26quot;");
}

function sanitize(str: string): string {
    return str.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
}

interface CardRenderOpts {
    restaurantName: string;
    restaurantLogoUrl: string;
    dishName: string;
    dishDescription: string;
    qrCodeUrl: string;
    primaryColor: string;
    secondaryColor: string;
    showTagline: boolean;
    tagline: string;
}

function renderCardHtml(opts: CardRenderOpts): string {
    const logoHtml = opts.restaurantLogoUrl
        ? `<img src="${opts.restaurantLogoUrl}" alt="Logo" style="width:40px;height:40px;border-radius:8px;margin:0 auto 8px;display:block;"/>`
        : "";
    const nameHtml = opts.restaurantName ? `<h2>${escapeHtml(opts.restaurantName)}</h2>` : "";
    const qrHtml = opts.qrCodeUrl ? `<img src="${opts.qrCodeUrl}" alt="QR Code"/>` : "";
    const dishHtml = opts.dishName ? `<h3>${escapeHtml(opts.dishName)}</h3>` : "";
    const descHtml = opts.dishDescription ? `<p class="desc">${escapeHtml(opts.dishDescription)}</p>` : "";
    const ctaHtml = opts.showTagline ? `<p class="cta">${escapeHtml(opts.tagline)}</p>` : "";

    return `<div class="card">${logoHtml}${nameHtml}${qrHtml}${dishHtml}${descHtml}${ctaHtml}</div>`;
}

function renderA4Layout(opts: CardRenderOpts): string {
    const card = renderCardHtml(opts);
    const cards = card + card + card + card;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>@page{size:A4;margin:1cm}body{margin:0;font-family:system-ui,-apple-system,sans-serif;color:#e5e5e5}.grid{display:grid;grid-template-columns:1fr 1fr;gap:1cm}.card{border:2px dashed #333;padding:1.5cm;text-align:center;border-radius:8px}.card h2{color:${opts.primaryColor};font-size:18px;margin:0 0 8px}.card img{width:200px;height:200px;margin:12px auto;display:block}.card h3{color:#e5e5e5;font-size:15px;margin:0 0 4px}.card .desc{color:#888;font-size:11px;margin:0 0 8px}.cta{color:${opts.primaryColor};font-weight:600;font-size:13px;margin:0}</style></head><body><div class="grid">${cards}</div></body></html>`;
}

function renderSingleCardLayout(opts: CardRenderOpts): string {
    const logoHtml = opts.restaurantLogoUrl
        ? `<img src="${opts.restaurantLogoUrl}" alt="Logo" style="width:36px;height:36px;border-radius:8px;margin:0 auto 8px;display:block;"/>`
        : "";

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>@page{size:10cm 10cm;margin:0.5cm}body{margin:0;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:0.5cm;color:#e5e5e5}h2{color:${opts.primaryColor};font-size:16px;margin:0 0 4px}img.qr{width:180px;height:180px;margin:8px auto;display:block}h3{color:#e5e5e5;font-size:14px;margin:0 0 4px}.desc{color:#888;font-size:10px;margin:0 0 6px}.cta{color:${opts.primaryColor};font-weight:600;font-size:12px;margin:0}</style></head><body>${logoHtml}<h2>${escapeHtml(opts.restaurantName)}</h2><img class="qr" src="${opts.qrCodeUrl}" alt="QR Code"/><h3>${escapeHtml(opts.dishName)}</h3>${opts.dishDescription ? `<p class="desc">${escapeHtml(opts.dishDescription)}</p>` : ""}${opts.showTagline ? `<p class="cta">${escapeHtml(opts.tagline)}</p>` : ""}</body></html>`;
}

function toCardOpts(options: PDFCardOptions): CardRenderOpts {
    return {
        restaurantName: options.restaurantName,
        restaurantLogoUrl: options.restaurantLogoUrl ?? "",
        dishName: options.dishName,
        dishDescription: options.dishDescription ?? "",
        qrCodeUrl: options.qrCodeUrl,
        primaryColor: options.primaryColor ?? DEFAULT_PRIMARY,
        secondaryColor: options.secondaryColor ?? DEFAULT_SECONDARY,
        showTagline: options.showTagline ?? true,
        tagline: options.tagline ?? DEFAULT_TAGLINE,
    };
}

export async function generatePDFCard(options: PDFCardOptions): Promise<PDFResult> {
    const { restaurantName, dishName, size } = options;
    const opts = toCardOpts(options);
    const filename = `${sanitize(restaurantName)}_${sanitize(dishName)}_qr_card.pdf`;
    const html = size === "a4" ? renderA4Layout(opts) : renderSingleCardLayout(opts);

    return {
        buffer: Buffer.from(html, "utf-8"),
        filename,
        contentType: "application/pdf",
    };
}

export async function generateBulkPDF(
    dishes: BulkPDFCard[],
    options?: { primaryColor?: string; secondaryColor?: string; tagline?: string }
): Promise<PDFResult> {
    const primaryColor = options?.primaryColor ?? DEFAULT_PRIMARY;
    const secondaryColor = options?.secondaryColor ?? DEFAULT_SECONDARY;
    const tagline = options?.tagline ?? DEFAULT_TAGLINE;
    const restaurantName = dishes[0]?.restaurantName || "restaurant";
    const filename = `${sanitize(restaurantName)}_qr_cards.pdf`;

    const pages: BulkPDFCard[][] = [];
    for (let i = 0; i < dishes.length; i += 4) {
        pages.push(dishes.slice(i, i + 4));
    }

    const emptyCard = renderCardHtml({
        restaurantName: "",
        restaurantLogoUrl: "",
        dishName: "",
        dishDescription: "",
        qrCodeUrl: "",
        primaryColor,
        secondaryColor,
        showTagline: false,
        tagline,
    });

    const pagesHtml = pages
        .map((page) => {
            const cards = page
                .map((d) =>
                    renderCardHtml({
                        restaurantName: d.restaurantName,
                        restaurantLogoUrl: "",
                        dishName: d.dishName,
                        dishDescription: d.dishDescription ?? "",
                        qrCodeUrl: d.qrCodeUrl,
                        primaryColor,
                        secondaryColor,
                        showTagline: true,
                        tagline,
                    })
                )
                .join("");
            const padded = cards + Array(Math.max(0, 4 - page.length)).fill(emptyCard).join("");
            return `<div class="grid">${padded}</div>`;
        })
        .join('<div class="page-break"></div>');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>@page{size:A4;margin:1cm}body{margin:0;font-family:system-ui,-apple-system,sans-serif;color:#e5e5e5}.grid{display:grid;grid-template-columns:1fr 1fr;gap:1cm}.card{border:2px dashed #333;padding:1.5cm;text-align:center;border-radius:8px}.card h2{color:${primaryColor};font-size:18px;margin:0 0 8px}.card img{width:200px;height:200px;margin:12px auto;display:block}.card h3{color:#e5e5e5;font-size:15px;margin:0 0 4px}.card .desc{color:#888;font-size:11px;margin:0 0 8px}.cta{color:${primaryColor};font-weight:600;font-size:13px;margin:0}.page-break{page-break-before:always}</style></head><body>${pagesHtml}</body></html>`;

    return {
        buffer: Buffer.from(html, "utf-8"),
        filename,
        contentType: "application/pdf",
    };
}