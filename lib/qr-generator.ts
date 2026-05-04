import QRCodeStyling from "qr-code-styling";
import { uploadQRFile } from "./upload";

export interface QRDesignConfig {
    logoUrl?: string;
    logoShape: 'circle' | 'square' | 'rounded-square' | 'shield';
    logoSizePercent: number;
    logoBorderColor?: string;
    logoBorderWidth: number;
    dotStyle: 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded';
    cornerSquareStyle: 'square' | 'extra-rounded' | 'dot';
    cornerDotStyle: 'square' | 'dot';
    foregroundColor: string;
    backgroundColor: string;
    frameStyle: 'none' | 'simple-border' | 'banner-bottom' | 'banner-top' | 'rounded-frame';
    frameText?: string;
    frameTextFont?: string;
    frameTextColor?: string;
    frameBackgroundColor?: string;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface QRGenerationResult {
    success: boolean;
    pngUrl?: string;
    svgUrl?: string;
    pdfUrl?: string;
    reliabilityScore?: number;
    error?: string;
}

export async function generateQRCode(
    arUrl: string,
    restaurantId: string,
    dishId: string | null,
    config: QRDesignConfig
): Promise<QRGenerationResult> {
    try {
        // Auto-upgrade to H error correction when logo is present
        const errorCorrection = config.logoUrl ? 'H' : config.errorCorrectionLevel;

        // Create QR code instance
        const qrCode = new QRCodeStyling({
            width: 1000,
            height: 1000,
            type: "canvas",
            data: arUrl,
            image: config.logoUrl,
            dotsOptions: {
                color: config.foregroundColor,
                type: config.dotStyle,
            },
            cornersSquareOptions: {
                color: config.foregroundColor,
                type: config.cornerSquareStyle,
            },
            cornersDotOptions: {
                color: config.foregroundColor,
                type: config.cornerDotStyle,
            },
            backgroundOptions: {
                color: config.backgroundColor,
            },
            // @ts-expect-error - errorCorrectionLevel is supported but not in types
            errorCorrectionLevel: errorCorrection,
            imageOptions: {
                imageSize: config.logoSizePercent / 100,
                margin: 0,
            },
        });

        // Generate PNG
        const pngBlob = await qrCode.getRawData("png");
        // Generate SVG
        const svgBlob = await qrCode.getRawData("svg");

        if (!pngBlob || !svgBlob) {
            return {
                success: false,
                error: 'Failed to generate QR code data'
            };
        }

        // Convert blobs to buffers
        const pngBuffer = Buffer.from(await (pngBlob as Blob).arrayBuffer());
        const svgBuffer = Buffer.from(await (svgBlob as Blob).arrayBuffer());

        // Upload files to Supabase
        const pngUpload = await uploadQRFile(pngBuffer, 'qr.png', restaurantId, dishId || undefined, 'png');
        const svgUpload = await uploadQRFile(svgBuffer, 'qr.svg', restaurantId, dishId || undefined, 'svg');

        if (!pngUpload.success || !svgUpload.success) {
            return {
                success: false,
                error: pngUpload.error || svgUpload.error || 'Upload failed'
            };
        }

        // Calculate reliability score
        const reliabilityScore = calculateReliabilityScore(config, !!config.logoUrl);

        return {
            success: true,
            pngUrl: pngUpload.url,
            svgUrl: svgUpload.url,
            reliabilityScore
        };
    } catch (error) {
        return {
            success: false,
            error: `QR generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

function calculateReliabilityScore(config: QRDesignConfig, hasLogo: boolean): number {
    let score = 100;

    // Error correction level impact
    if (config.errorCorrectionLevel === 'L') score -= 30;
    else if (config.errorCorrectionLevel === 'M') score -= 15;
    else if (config.errorCorrectionLevel === 'Q') score -= 5;

    // Logo presence (auto-upgraded to H, so minimal penalty)
    if (hasLogo) {
        score -= 5; // Small penalty for logo presence
    }

    // Color contrast impact
    const contrastPenalty = calculateColorContrastPenalty(config.foregroundColor, config.backgroundColor);
    score -= contrastPenalty;

    // Logo size impact
    if (hasLogo) {
        const logoSize = config.logoSizePercent;
        if (logoSize > 25) score -= 15;
        else if (logoSize > 20) score -= 10;
        else if (logoSize > 15) score -= 5;
    }

    // Frame impact
    if (config.frameStyle !== 'none') {
        score -= 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateColorContrastPenalty(foreground: string, background: string): number {
    const fg = parseColor(foreground);
    const bg = parseColor(background);

    const luminance1 = getLuminance(fg);
    const luminance2 = getLuminance(bg);

    const contrastRatio = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);

    if (contrastRatio < 3) return 20;
    if (contrastRatio < 4.5) return 10;
    if (contrastRatio < 7) return 5;

    return 0;
}

function parseColor(color: string): { r: number; g: number; b: number } {
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b };
    }

    if (color.startsWith('rgb')) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }
    }

    return { r: 255, g: 255, b: 255 };
}

function getLuminance(color: { r: number; g: number; b: number }): number {
    const { r, g, b } = color;
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}