"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen   flex items-center justify-center p-4">
            <div className="text-center space-y-6">
                <div className="text-ember text-display-lg font-display">ERROR</div>
                <p className="text-text-secondary font-body text-body-md">
                    Something went wrong
                </p>
                <button
                    onClick={reset}
                    className="bg-plasma text-void px-6 py-3 font-ui text-sm tracking-widest uppercase hover:shadow-[0_0_20px_var(--color-plasma)] transition-all duration-300"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}