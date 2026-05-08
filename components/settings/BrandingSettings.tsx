"use client";

import ImageUploader from "@/components/shared/ImageUploader";
import { Restaurant } from "@/types";

interface BrandingSettingsProps {
    restaurant: Restaurant;
    onImageUpload: (field: "logoUrl" | "coverImageUrl" | "bannerUrl") => (url: string) => void;
}

export default function BrandingSettings({ restaurant, onImageUpload }: BrandingSettingsProps) {
    return (
        <div className="space-y-6">
            <div className="border border-border bg-terminal p-8 space-y-8 rounded-lg shadow-sm">
                <div>
                    <h2 className="text-body-md font-ui text-text-primary tracking-widest uppercase mb-1">Restaurant Logo</h2>
                    <p className="text-body-xs font-mono text-text-tertiary mb-6">Displayed in the menu header. Recommended: square, min 200×200px.</p>
                    <div className="max-w-[240px]">
                        <ImageUploader
                            label="Logo"
                            hint="PNG, JPG, WebP · max 5MB"
                            type="logo"
                            currentUrl={restaurant.logoUrl}
                            onUploadSuccess={onImageUpload("logoUrl")}
                            aspectClass="aspect-square"
                        />
                    </div>
                </div>

                <div className="border-t border-border/50 pt-8">
                    <h2 className="text-body-md font-ui text-text-primary tracking-widest uppercase mb-1">Cover / Hero Banner</h2>
                    <p className="text-body-xs font-mono text-text-tertiary mb-6">Full-width image displayed at the top of your themed menu. Recommended: 1200×400px.</p>
                    <ImageUploader
                        label="Cover Banner"
                        hint="PNG, JPG, WebP · max 5MB · 1200×400 recommended"
                        type="cover"
                        currentUrl={restaurant.coverImageUrl}
                        onUploadSuccess={onImageUpload("coverImageUrl")}
                        aspectClass="aspect-[3/1]"
                    />
                </div>

                <div className="border-t border-border/50 pt-8">
                    <h2 className="text-body-md font-ui text-text-primary tracking-widest uppercase mb-1">Background Texture</h2>
                    <p className="text-body-xs font-mono text-text-tertiary mb-6">Optional texture overlay behind your theme&apos;s background gradient. Recommended: subtle pattern.</p>
                    <ImageUploader
                        label="Background Texture"
                        hint="PNG, JPG, WebP · max 5MB · tiling pattern recommended"
                        type="banner"
                        currentUrl={restaurant.bannerUrl}
                        onUploadSuccess={onImageUpload("bannerUrl")}
                        aspectClass="aspect-video"
                    />
                </div>
            </div>

            {restaurant.menuQrUrl && (
                <div className="border border-border bg-terminal p-8 space-y-6 rounded-lg shadow-sm">
                    <h2 className="text-body-md font-ui text-text-primary tracking-widest uppercase">Menu QR Code</h2>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="bg-white p-3 rounded-xl border border-border shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={restaurant.menuQrUrl} alt="Menu QR" className="w-32 h-32" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <p className="text-body-xs font-mono text-text-tertiary break-all bg-void/30 p-3 rounded border border-border/50">
                                {restaurant.menuQrUrl}
                            </p>
                            <a 
                                href={restaurant.menuQrUrl} 
                                download="menu-qr.png" 
                                className="inline-flex items-center px-6 py-2 border border-plasma text-plasma font-ui text-xs tracking-widest uppercase hover:bg-plasma/10 transition-all rounded-md font-bold"
                            >
                                Download QR Image
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
