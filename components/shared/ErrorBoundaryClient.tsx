"use client";

import { useEffect, useState, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught error:", error);
      setHasError(true);
      setError(error.error);
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) {
    if (fallback) return fallback;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-void">
        <div className="max-w-md w-full border border-ember/50 bg-terminal/50 p-6 rounded-none">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-ember text-2xl">⚠️</span>
            <h2 className="text-body-lg font-display text-text-accent tracking-widest">
              Something went wrong
            </h2>
          </div>
          <p className="text-body-sm font-body text-text-secondary mb-4">
            The application encountered an unexpected error.
          </p>
          {error && (
            <pre className="text-body-xs font-mono text-text-tertiary bg-surface p-3 rounded-none mb-4 overflow-auto max-h-32">
              {error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-none bg-plasma text-void px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
