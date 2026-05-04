"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-terminal/80 backdrop-blur-sm border border-border p-8 rounded-none">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-2 border-success rounded-full flex items-center justify-center mx-auto">
              <span className="text-success text-2xl">✓</span>
            </div>
            <h1 className="text-display-sm font-display text-text-accent tracking-widest">
              Check Your Email
            </h1>
            <p className="text-body-sm font-body text-text-secondary">
              If an account exists for {email}, you will receive a password reset link.
            </p>
            <Link
              href="/login"
              className="block w-full rounded-none border border-plasma text-plasma px-6 py-3 font-ui text-sm tracking-widest uppercase text-center hover:bg-plasma/10 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-terminal/80 backdrop-blur-sm border border-border p-8 rounded-none">
        <div className="text-center mb-6">
          <h1 className="text-display-sm font-display text-text-accent tracking-widest">
            Reset Password
          </h1>
          <p className="text-body-sm font-body text-text-secondary mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 border-l-2 border-ember bg-ember/5">
            <p className="text-body-sm font-body text-ember">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-body-xs font-ui text-text-secondary tracking-wider uppercase">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-none border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_15px_var(--color-plasma-glow)] outline-none transition-all font-body"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-plasma text-void px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-body-sm font-ui text-text-tertiary hover:text-plasma transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
