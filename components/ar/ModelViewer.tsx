"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import AnnotationOverlay from "./AnnotationOverlay";
import { getDishCategoryFromAllergens, SFX_CATEGORIES } from "@/lib/health-converter";

// Type declarations for model-viewer
// eslint-disable-next-line @typescript-eslint/no-namespace
declare module 'react' {
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace JSX {
interface IntrinsicElements {
  'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    src?: string;
    alt?: string;
    'auto-rotate'?: boolean;
    'camera-controls'?: boolean;
    ar?: boolean;
    'ar-modes'?: string;
    loading?: string;
    'shadow-intensity'?: string;
    'shadow-softness'?: string;
    scale?: string;
    'ar-scale'?: string;
    className?: string;
    style?: React.CSSProperties;
    ref?: React.Ref<HTMLElement>;
    onClick?: () => void;
  };
}
}
}

interface Annotation {
  label: string;
  position: { x: number; y: number; z: number };
  description?: string;
}

interface ModelViewerProps {
  glbUrl: string;
  dishName: string;
  scale: { x: number; y: number; z: number };
  arSizeLocked: boolean;
  annotations?: Annotation[];
  allergens?: string[];
  onFirstInteraction?: () => void;
}

const ARModelViewer = forwardRef<HTMLElement, ModelViewerProps>(function ARModelViewer({
  glbUrl,
  dishName,
  scale,
  arSizeLocked,
  annotations = [],
  allergens = [],
  onFirstInteraction,
}, ref) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showReferenceScale, setShowReferenceScale] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const modelRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modelLoadedRef = useRef(false);

  const setRef = (node: HTMLElement | null) => {
    modelRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setProgress(0);
    modelLoadedRef.current = false;

    const script = document.createElement('script');
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
    script.async = true;
    script.type = 'module';
    document.head.appendChild(script);

    const category = getDishCategoryFromAllergens(allergens);
    const sfxUrl = SFX_CATEGORIES[category] || SFX_CATEGORIES.default;
    audioRef.current = new Audio(sfxUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      document.head.removeChild(script);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [glbUrl, allergens]);

    useEffect(() => {
        const modelElement = modelRef.current;
        if (!modelElement) return;

const handleLoad = () => {
      setIsLoading(false);
      setProgress(100);
      modelLoadedRef.current = true;

      if (sfxEnabled && audioRef.current && hasInteracted) {
        audioRef.current.play().catch(() => {});
      }
    };

        const handleError = () => {
            setIsLoading(false);
            setHasError(true);
        };

        const handleProgress = (event: { detail: { totalProgress: number } }) => {
            const progress = event.detail.totalProgress;
            setProgress(Math.round(progress * 100));
        };

        modelElement.addEventListener('load', handleLoad);
        modelElement.addEventListener('error', handleError);
        modelElement.addEventListener('progress', handleProgress);

        return () => {
            modelElement.removeEventListener('load', handleLoad);
            modelElement.removeEventListener('error', handleError);
            modelElement.removeEventListener('progress', handleProgress);
        };
}, [glbUrl, sfxEnabled, hasInteracted]);

  const handleFirstInteraction = () => {
    if (hasInteracted) return;

    setHasInteracted(true);
    onFirstInteraction?.();

    if (sfxEnabled && audioRef.current && modelLoadedRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleSFX = () => {
    const newSfxEnabled = !sfxEnabled;
    setSfxEnabled(newSfxEnabled);

    if (newSfxEnabled && audioRef.current) {
      if (hasInteracted && modelLoadedRef.current) {
        audioRef.current.play().catch(() => {});
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
        <div className="relative w-full h-96 md:h-[500px] bg-terminal rounded-none border border-border overflow-hidden">
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-2 border-plasma border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-body-sm font-body text-text-secondary">
                            Loading {dishName}...
                        </p>
                        <div className="w-48 h-2 bg-terminal border border-border rounded-none mx-auto overflow-hidden">
                            <div
                                className="h-full bg-plasma transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-body-xs font-mono text-plasma">{progress}%</p>
                    </div>
                </div>
            )}

            {/* Error state */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center z-10  /80 backdrop-blur-sm">
                    <div className="text-center space-y-4 p-6">
                        <div className="w-16 h-16 border-2 border-ember rounded-full flex items-center justify-center mx-auto">
                            <span className="text-ember text-body-lg">⚠️</span>
                        </div>
                        <p className="text-body-md font-body text-text-primary">
                            Unable to load 3D model
                        </p>
                        <p className="text-body-sm font-body text-text-secondary">
                            Please try again or contact support
                        </p>
                    </div>
                </div>
            )}

{/* Model Viewer */}
    <model-viewer
      ref={setRef}
      src={glbUrl}
      alt={`${dishName} 3D model`}
      auto-rotate
      camera-controls
      ar
      ar-modes="webxr scene-viewer quick-look"
      loading="eager"
      shadow-intensity="1"
      shadow-softness="0.5"
      scale={`${scale.x} ${scale.y} ${scale.z}`}
      ar-scale={arSizeLocked ? "fixed" : "auto"}
      className="w-full h-full"
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
      onClick={handleFirstInteraction}
    >
                {/* AR prompt */}
                <button
                    slot="ar-button"
                    className="absolute bottom-4 right-4 bg-plasma text-void px-4 py-2 rounded-none font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors z-20"
                >
                    View in AR
                </button>
            </model-viewer>

            {/* Instructions overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-terminal/80 backdrop-blur-sm border border-border p-3 rounded-none">
                <p className="text-body-xs font-body text-text-secondary text-center">
                    Rotate: Drag • Zoom: Pinch • AR: Tap &quot;View in AR&quot; • Place on table
                </p>
            </div>

{/* Feature Annotations */}
    <AnnotationOverlay annotations={annotations} visible={!isLoading && !hasError} />

    {/* Reference Scale Toggle */}
    <button
      onClick={() => setShowReferenceScale(!showReferenceScale)}
      className={`absolute top-4 left-4 z-20 px-3 py-1.5 border rounded-none font-ui text-xs tracking-widest uppercase transition-colors ${
        showReferenceScale
          ? "bg-plasma text-void border-plasma"
          : "bg-void/80 backdrop-blur-md text-text-secondary border-border hover:border-plasma"
      }`}
      title="Toggle Reference Scale"
    >
      📏 Scale
    </button>

    {/* Reference Scale Card */}
    {showReferenceScale && (
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 animate-materialize">
        <div className="relative">
          <div className="w-[85.6mm] h-[54mm] bg-gradient-to-br from-ivory to-ivory-light border-2 border-plasma rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center">
            <div className="text-center">
              <p className="font-mono text-body-xs text-void tracking-wider">85.6 × 54 mm</p>
              <p className="font-body text-body-xs text-void/70">Credit Card Size</p>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-plasma/50" />
        </div>
      </div>
    )}

    {/* SFX Toggle */}
    <button
      onClick={toggleSFX}
      className={`absolute top-4 left-32 z-20 w-10 h-10 border rounded-none flex items-center justify-center transition-colors ${
        sfxEnabled
          ? "bg-neon-violet/20 border-neon-violet text-neon-violet"
          : "bg-void/80 backdrop-blur-md border-border text-text-tertiary hover:border-neon-violet"
      }`}
      title={sfxEnabled ? "Mute Sound" : "Enable Sound"}
    >
{sfxEnabled ? "🔊" : "🔇"}
    </button>
  </div>
  );
});

export default ARModelViewer;