"use client";

interface LoadingScreenProps {
  title?: string;
  message?: string;
}

export function LoadingScreen({ title = "Loading", message }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-void">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Logo */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-2 border-plasma/30 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 border-2 border-plasma/50 rounded-full animate-pulse delay-100"></div>
          <div className="absolute inset-4 border-2 border-plasma rounded-full animate-pulse delay-200"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-plasma rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-display-sm font-display text-text-accent tracking-widest uppercase">
            {title}
          </h2>
          {message && <p className="text-body-sm font-body text-text-secondary">{message}</p>}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-surface rounded-none overflow-hidden">
          <div className="h-full bg-plasma w-1/3 animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>

        {/* Terminal Text Effect */}
        <div className="flex items-center justify-center gap-1">
          <span className="w-1 h-4 bg-plasma/50 animate-pulse"></span>
          <span className="w-1 h-4 bg-plasma/50 animate-pulse delay-100"></span>
          <span className="w-1 h-4 bg-plasma/50 animate-pulse delay-200"></span>
        </div>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="border border-border bg-terminal p-6 rounded-none animate-pulse">
      <div className="h-6 bg-surface/50 rounded-none w-3/4 mb-4"></div>
      <div className="h-4 bg-surface/50 rounded-none w-full mb-2"></div>
      <div className="h-4 bg-surface/50 rounded-none w-2/3"></div>
    </div>
  );
}

export function LoadingTable() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border border-border bg-terminal p-4 rounded-none animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-surface/50 rounded-none w-32"></div>
              <div className="h-3 bg-surface/50 rounded-none w-24"></div>
            </div>
            <div className="h-8 bg-surface/50 rounded-none w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-border bg-terminal p-4 rounded-none animate-pulse">
          <div className="h-4 bg-surface/50 rounded-none w-16 mb-2"></div>
          <div className="h-8 bg-surface/50 rounded-none w-full"></div>
        </div>
      ))}
    </div>
  );
}

export function Skeleton({ className, width = "w-full", height = "h-4" }: { className?: string; width?: string; height?: string }) {
  return <div className={`bg-surface/50 rounded-none animate-pulse ${width} ${height} ${className || ""}`}></div>;
}

export default LoadingScreen;
