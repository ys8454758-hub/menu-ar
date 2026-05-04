"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BlurIn, SplitText } from "./animations";
import IPhone3D from "./IPhone3D";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Delay video loading to prioritize critical text/CSS
    const timer = setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        const source = "https://stream.mux.com/s8pMcOvMQXc4GD6AX4e1o01xFogFxipmuKltNfSYza0200.m3u8";
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          // Standard MP4 fallback for broad support if HLS is not natively handled
          video.src = source;
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-screen w-full">
      {/* Background color & Gradient Fallback */}
      <div className="absolute inset-0 bg-[#2a1f00] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-tr from-[#1a1300] via-[#2a1f00] to-plasma/5 transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`} />
      </div>

      {/* Video layer - z-0 */}
      {!videoError && (
        <div className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover z-0"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            onPlaying={() => setIsVideoLoaded(true)}
            onError={() => setVideoError(true)}
          />
        </div>
      )}

      {/* Video fallback - shown if video fails to load */}
      {videoError && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1300] via-[#2a1f00] to-[#3a2d00] z-0" />
      )}

      {/* Bottom gradient fade - z-10 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #2a1f00 0%, transparent 100%)",
        }}
      />

      {/* Content layer - z-20 */}
      <div className="relative z-20 flex h-full items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Badge */}
            <BlurIn duration={0.6} delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm mb-6">
                <Sparkles className="w-3 h-3 text-white/80" />
                <span className="text-sm font-medium text-white/80">
                  The Future of Dining is Here
                </span>
              </div>
            </BlurIn>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight lg:leading-[1.2] text-foreground mb-6">
              <div className="block">
                <SplitText text="Bring Your Menu" />
              </div>
              <div className="block">
                <SplitText text="to Life in" delay={0.08 * 3} />
              </div>
              <div className="block">
                <SplitText
                  text="3D & AR."
                  delay={0.08 * 5}
                  className="italic font-serif"
                />
              </div>
            </h1>

            {/* Subtitle */}
            <BlurIn duration={0.6} delay={0.4}>
              <p className="text-white/80 text-lg font-normal leading-relaxed max-w-xl mb-12">
                Let your customers see their food in stunning augmented reality before they order. 
                Increase sales, reduce food waste, and deliver an unforgettable dining experience.
              </p>
            </BlurIn>

            {/* CTA Buttons */}
            <BlurIn duration={0.6} delay={0.6}>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center px-8 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium hover:bg-white/30 transition-colors"
                >
                  See a Demo
                </Link>
              </div>
            </BlurIn>
          </div>
          
          <div className="hidden lg:flex justify-end pr-12">
            {/* Optional secondary device or graphic could go here */}
          </div>
        </div>
      </div>

      {/* Mobile Mockup - 100% inside the Hero section - z-40 to prevent header blocking */}
      <div className="absolute bottom-12 right-0 lg:right-24 w-[500px] h-[800px] z-40 pointer-events-none overflow-visible">
        <div className="relative w-full h-full pointer-events-auto z-20">
          <IPhone3D />
        </div>
      </div>
    </section>
  );
}