export type DotStyle = "square" | "rounded" | "dots" | "classy" | "classy-rounded";
export type CornerStyle = "square" | "dot" | "extra-rounded";
export type LogoShape = "circle" | "square" | "rounded-square" | "shield";
export type FrameStyle = "none" | "bottom-bar" | "top-bar" | "full-border";
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
export interface QRDesign {
    dotStyle: DotStyle;
    cornerSquareStyle: CornerStyle;
    cornerDotStyle: CornerStyle;
    foregroundColor: string;
    backgroundColor: string;
    logoUrl: string;
    logoShape: LogoShape;
    logoSizePercent: number;
    frameStyle: FrameStyle;
    frameText: string;
    errorCorrectionLevel: ErrorCorrectionLevel;
}
export const defaultDesign: QRDesign = {
    dotStyle: "rounded",
    cornerSquareStyle: "extra-rounded",
    cornerDotStyle: "dot",
    foregroundColor: "#00ff88",
    backgroundColor: "#0a0a0a",
    logoUrl: "",
    logoShape: "circle",
    logoSizePercent: 15,
    frameStyle: "none",
    frameText: "",
    errorCorrectionLevel: "H",
};