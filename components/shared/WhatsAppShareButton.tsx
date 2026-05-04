"use client";

import { useState, useEffect } from "react";

interface WhatsAppShareButtonProps {
  dishName: string;
  dishSlug: string;
  restaurantName: string;
  className?: string;
}

export default function WhatsAppShareButton({
  dishName,
  dishSlug,
  restaurantName,
  className = "",
}: WhatsAppShareButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleShare = () => {
    if (!isClient) return;

    const shareUrl = `${window.location.origin}/ar/${restaurantName
      .toLowerCase()
      .replace(/\s+/g, "-")}/${dishSlug}`;
    const text = `Check out ${dishName} at ${restaurantName} in 3D AR! Scan to see it on your table.`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);

    // Check if mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: use WhatsApp app
      window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, "_blank");
    } else {
      // Desktop: copy link and show toast
      navigator.clipboard.writeText(shareUrl);
      alert(`Link copied! Share it on WhatsApp: ${shareUrl}`);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white font-ui text-sm tracking-widest uppercase rounded-none hover:bg-[#25D366]/90 transition-colors ${className}`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.163-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.485-1.761-1.658-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.246-1.262.488-.543.644-.94.644-.94s.395-.767.593-1.137c.198-.371.198-.694.148-.793-.049-.099-.173-.149-.371-.248M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      </svg>
      Share on WhatsApp
    </button>
  );
}
