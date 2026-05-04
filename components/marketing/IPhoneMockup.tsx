"use client";

import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export type MockupColor = "titanium" | "plasma" | "midnight" | "gold" | "orange";

interface IPhoneMockupProps {
  videoSrc?: string;
  className?: string;
  color?: MockupColor;
}

const colorThemes = {
  titanium: {
    frame: "bg-[#8e8e93]",
    side: "bg-[#b0b0b5]",
    back: "bg-[#2c2c2e]",
    basePlate: "bg-[#3a3a3c]",
    border: "border-[#1c1c1e]/40",
    glow: "from-white/5 to-transparent",
    accent: "bg-[#636366]",
  },
  plasma: {
    frame: "bg-plasma/10 backdrop-blur-xl",
    side: "bg-plasma/40",
    back: "bg-plasma/20 backdrop-blur-3xl",
    basePlate: "bg-plasma/30 backdrop-blur-md",
    border: "border-plasma/30",
    glow: "from-plasma/40 to-plasma/5",
    accent: "bg-plasma/60",
  },
  midnight: {
    frame: "bg-[#1c1c1e]",
    side: "bg-[#2c2c2e]",
    back: "bg-[#0a0a0c]",
    basePlate: "bg-[#1c1c1e]",
    border: "border-black/50",
    glow: "from-indigo-500/5 to-transparent",
    accent: "bg-[#3a3a3c]",
  },
  gold: {
    frame: "bg-[#4a3a1a]",
    side: "bg-[#8a7b5a]",
    back: "bg-[#1a1408]",
    basePlate: "bg-[#2a2210]",
    border: "border-[#3a2e15]/40",
    glow: "from-orange-400/5 to-transparent",
    accent: "bg-[#6a5b3a]",
  },
  orange: {
    frame: "bg-[#FF7A00]", // Vivid Orange
    side: "bg-[#E67E22]",  // Brushed Bronze-Orange Titanium
    back: "bg-[#FF7A00]",  // Frosted Vivid Orange glass
    basePlate: "bg-[#FF8C00]", // Glossy Orange platform
    logo: "bg-[#D35400]",  // Matte Deep Orange Logo
    border: "border-[#D35400]/40",
    glow: "from-[#FF7A00]/40 to-transparent",
    accent: "bg-[#E67E22]",
  },
};

export default function IPhoneMockup({ 
  videoSrc = "https://assets.mixkit.co/videos/preview/mixkit-serving-a-delicious-looking-dish-in-a-restaurant-4768-large.mp4",
  className = "",
  color = "orange"
}: IPhoneMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const theme = colorThemes[color];

  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const rotateX = useSpring(rotX, { stiffness: 100, damping: 25 });
  const rotateY = useSpring(rotY, { stiffness: 80, damping: 25 });
  const rotateZ = 8; // Slightly more upright as per concept

  const shineOpacity = useTransform(rotY, (v) => {
    const modV = Math.abs(v % 360);
    if (modV > 150 && modV < 210) return 1 - Math.abs(modV - 180) / 30;
    return 0;
  });

  const shineX = useTransform(rotY, (v) => {
    const modV = (v % 360);
    return (modV - 180) * 0.4;
  });

  useEffect(() => {
    const spin = async () => {
       await animate(rotY, -180, { duration: 1.5, ease: "easeInOut", delay: 0.5 });
       await new Promise(r => setTimeout(r, 800)); 
       await animate(rotY, -360, { duration: 1.5, ease: "easeInOut" });
    };
    spin();
  }, [rotY]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShouldLoadVideo(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePan = (event: React.PointerEvent, info: { delta: { x: number } }) => {
    rotX.set(0);
    rotY.set(rotY.get() + info.delta.x * 0.5);
  };

  const handlePanEnd = () => { animate(rotY, 0, { type: "spring", stiffness: 90, damping: 22 }); };

  const width = 310;
  const height = width * (19.5 / 9);
  const thickness = 26; // Thicker Pro Max feel
  const cameraBumpExtrusion = 6;
  const lensExtrusion = 4;

  return (
    <div className={`relative perspective-3000 py-32 pr-20 cursor-grab active:cursor-grabbing ${className}`}>
      <motion.div
        ref={containerRef}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ width, height, rotateX, rotateY, rotateZ, transformStyle: "preserve-3d" }}
        className="relative group mx-auto"
      >
        {/* === FRONT PANEL === */}
        <div 
          style={{ transform: `translateZ(${thickness/2}px)`, transformStyle: "preserve-3d" }}
          className={`absolute inset-0 rounded-[3.6rem] p-[3px] ${theme.frame} border border-black/20 shadow-2xl flex flex-col`}
        >
          <div className="relative flex-1 rounded-[3.4rem] overflow-hidden bg-black ring-1 ring-white/10">
             {/* Ultra-Thinner Dynamic Island */}
             <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#050505] rounded-full z-50 flex items-center justify-end pr-3">
                <div className="w-1 h-1 rounded-full bg-zinc-800/50" />
             </div>
             
             {/* Screen Content */}
             {shouldLoadVideo && !videoError ? (
                <div className="relative w-full h-full">
                    <div className={`absolute inset-0 bg-orange-500/10 mix-blend-screen pointer-events-none transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`} />
                    <video ref={videoRef} src={videoSrc} className={`w-full h-full object-cover transition-opacity duration-1500 ${isVideoLoaded ? 'opacity-100' : 'opacity-20'}`} autoPlay loop muted playsInline onPlaying={() => setIsVideoLoaded(true)} onError={() => setVideoError(true)} />
                </div>
             ) : (
                <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center text-[8px] tracking-[0.4em] text-zinc-700 font-bold">IPHONE 17 PRO MAX</div>
             )}
          </div>
        </div>

        {/* === BACK PANEL (HORIZONTAL CAMERA) === */}
        <div 
          style={{ transform: `translateZ(-${thickness/2}px) rotateY(180deg)`, transformStyle: "preserve-3d" }}
          className={`absolute inset-0 rounded-[3.6rem] ${theme.back} border border-white/10 shadow-2xl overflow-visible p-6 flex flex-col items-center`}
        >
          {/* APPLE LOGO */}
          <div className="mt-auto mb-[40%] flex flex-col items-center opacity-90">
             <div className={`w-14 h-14 ${theme.logo} [mask-image:url('https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]`} />
          </div>

          {/* HORIZONTAL CAMERA MODULE (IPHONE 17 PRO MAX CONCEPT) */}
          <div 
            style={{ 
              transform: `translateZ(${cameraBumpExtrusion}px)`, 
              transformStyle: "preserve-3d"
            }}
            className={`absolute top-6 left-6 w-[230px] h-[105px] rounded-[2.8rem] ${theme.basePlate} shadow-2xl backdrop-blur-md border border-white/20`}
          >
            {/* Bump Side Walls */}
            <div style={{ transform: "rotateX(90deg)", width: "100%", height: cameraBumpExtrusion }} className="absolute top-0 left-0 bg-black/20 origin-top rounded-t-[2.8rem]" />
            <div style={{ transform: "rotateX(-90deg)", width: "100%", height: cameraBumpExtrusion }} className="absolute bottom-0 left-0 bg-black/30 origin-bottom rounded-b-[2.8rem]" />
            <div style={{ transform: "rotateY(-90deg)", height: "100%", width: cameraBumpExtrusion }} className="absolute top-0 left-0 bg-black/20 origin-left rounded-l-[2.8rem]" />
            <div style={{ transform: "rotateY(90deg)", height: "100%", width: cameraBumpExtrusion }} className="absolute top-0 right-0 bg-black/30 origin-right rounded-r-[2.8rem]" />

            {/* LENSES - Triangle Cluster on the Left */}
            {[
               { id: 'ultra', x: 20, y: 14, shine: true },
               { id: 'main', x: 20, y: 52 },
               { id: 'tele', x: 55, y: 33 }
            ].map((lens) => (
               <div key={lens.id} style={{ transform: `translateZ(${lensExtrusion}px) translateX(${lens.x}px) translateY(${lens.y}px)`, transformStyle: "preserve-3d" }} className="absolute w-12 h-12 rounded-full bg-[#050505] ring-2 ring-white/10">
                  <div className="absolute inset-0 rounded-full border border-white/20 bg-black shadow-inner" />
                  <div className="absolute inset-2.5 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                     <div className="w-2.5 h-2.5 rounded-full bg-blue-500/10 ring-1 ring-blue-400/20" />
                  </div>
                  {lens.shine && (
                     <motion.div style={{ opacity: shineOpacity, x: shineX, background: "radial-gradient(circle, rgba(255,230,180,0.8) 0%, rgba(255,230,180,0) 80%)" }} className="absolute inset-0 pointer-events-none blur-[2px] rounded-full" />
                  )}
                  {/* Lens Side Walls */}
                  <div style={{ transform: "rotateY(90deg) translateZ(24px)", width: lensExtrusion, height: 48, top: 0 }} className="absolute right-0 bg-black/95" />
                  <div style={{ transform: "rotateY(-90deg) translateZ(24px)", width: lensExtrusion, height: 48, top: 0 }} className="absolute left-0 bg-black/95" />
               </div>
            ))}

            {/* SENSORS - Cluster on the Right */}
            {/* Flash */}
            <div style={{ transform: "translateZ(3px) translateX(175px) translateY(18px)" }} className="absolute w-6 h-6 rounded-full bg-zinc-100 shadow-[0_0_15px_white/30] border border-white/40" />
            {/* LiDAR/Sensor */}
            <div style={{ transform: "translateZ(3px) translateX(178px) translateY(65px)" }} className="absolute w-7 h-7 rounded-full bg-[#080808] border border-white/10 shadow-inner" />
            <div style={{ transform: "translateZ(2px) translateX(120px) translateY(45px)" }} className="absolute w-1.5 h-1.5 rounded-full bg-white/20 blur-[0.5px]" />
          </div>
        </div>

        {/* === SIDE PANELS (VIVID ORANGE TITANIUM) === */}
        {/* Right Face */}
        <div style={{ width: thickness, height: height, right: 0, top: 0, transform: `rotateY(90deg) translateZ(${width/2}px)`, transformStyle: "preserve-3d" }} className={`absolute ${theme.side} border-l border-r border-black/20 rounded-[1.8rem]`}>
           <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,#fff_1px,#fff_2px)]" />
           {/* Power Button */}
           <div className={`absolute top-40 -right-[1px] w-[5px] h-28 ${theme.accent} rounded-l-md shadow-xl`} />
        </div>
        {/* Left Face */}
        <div style={{ width: thickness, height: height, left: 0, top: 0, transform: `rotateY(-90deg) translateZ(${width/2}px)`, transformStyle: "preserve-3d" }} className={`absolute ${theme.side} border-l border-r border-black/20 rounded-[1.8rem]`}>
           <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,#fff_1px,#fff_2px)]" />
           {/* Action Button */}
           <div className={`absolute top-36 -left-[1px] w-[5px] h-12 ${theme.accent} rounded-r-md shadow-xl`} />
           {/* Volume Buttons */}
           <div className={`absolute top-56 -left-[1px] w-[5px] h-20 ${theme.accent} rounded-r-md shadow-xl`} />
           <div className={`absolute top-84 -left-[1px] w-[5px] h-20 ${theme.accent} rounded-r-md shadow-xl`} />
        </div>
        {/* Top Face */}
        <div style={{ width: width, height: thickness, top: 0, left: 0, transform: `rotateX(90deg) translateZ(${height/2}px)`, transformStyle: "preserve-3d" }} className={`absolute ${theme.side} border-t border-b border-black/10 rounded-[1.8rem]`} />
        {/* Bottom Face */}
        <div style={{ width: width, height: thickness, bottom: 0, left: 0, transform: `rotateX(-90deg) translateZ(${height/2}px)`, transformStyle: "preserve-3d" }} className={`absolute ${theme.side} border-t border-b border-black/10 rounded-[1.8rem]`} />

        {/* Ambient Glow */}
        <motion.div style={{ transform: "translateZ(-120px)" }} className={`absolute inset-0 blur-[200px] -z-10 rounded-[6rem] opacity-30 ${color === 'orange' ? 'bg-[#FF7A00]' : 'bg-plasma'}`} />
      </motion.div>
    </div>
  );
}
