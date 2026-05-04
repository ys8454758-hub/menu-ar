export type LogoShape = "circle" | "square" | "rounded-square" | "shield";

export interface CompositorOptions {
    qrImageBuffer: Buffer;
    logoBuffer: Buffer;
    shape: LogoShape;
    logoSizePercent: number;
    borderColor: string;
    borderWidth: number;
    backgroundColor: string;
}

export function getLogoConfig(options: {
    logoUrl: string;
    shape: LogoShape;
    sizePercent: number;
    borderColor: string;
    borderWidth: number;
    backgroundColor: string;
}) {
    return {
        src: options.logoUrl,
        width: `${options.sizePercent}%`,
        height: `${options.sizePercent}%`,
        hideBackgroundDots: true,
        margin: Math.round(options.borderWidth / 2),
        backgroundColor: options.backgroundColor,
        borderColor: options.borderColor,
        border: options.borderWidth,
        borderRadius: options.shape === "circle" ? 50 : options.shape === "rounded-square" ? 15 : 0,
    };
}

export function calculateSafeZone(qrSize: number, logoSizePercent: number) {
    const logoSize = qrSize * (logoSizePercent / 100);
    const x = (qrSize - logoSize) / 2;
    const y = (qrSize - logoSize) / 2;
    return { x, y, size: logoSize };
}