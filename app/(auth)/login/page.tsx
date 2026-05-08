"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, LogIn, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) setError("Authentication failed. Please try again.");
    
    // Optional: Auto-redirect if you want, but user asked to "remove this option"
    // which usually means they want the login form accessible.
  }, [router]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.email.trim() || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (authError) { setError(`Login failed: ${authError.message}`); return; }
      if (data.user) await router.push("/dashboard/dishes");
    } catch (err) {
      setError(`Login failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-plasma/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-violet/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block relative group">
            <div className="absolute -inset-4 bg-plasma/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h1 className="relative text-display-xl font-display text-text-accent tracking-widest">
              Livin3D
            </h1>
          </Link>
          <p className="mt-3 text-body-md font-body text-text-secondary">
            Welcome back — sign in to your dashboard
          </p>
          <div className="mt-2 w-24 h-0.5 bg-gradient-to-r from-transparent via-plasma to-transparent mx-auto" />
        </div>

        {/* Card */}
        <div className="relative bg-terminal/80 backdrop-blur-sm border border-border overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-plasma to-transparent" />

          <div className="p-8 space-y-6">
            {/* Error banner */}
            {error && (
              <div className="bg-ember/10 border border-ember/30 border-l-2 border-l-ember p-4 flex items-start gap-3">
                <span className="text-ember text-lg leading-none mt-0.5">⚠</span>
                <p className="text-body-sm font-body text-ember">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-body-xs font-ui text-text-secondary tracking-widest uppercase block">
                  Email Address
                </label>
                <input
                  id="email" type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  className="w-full border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_15px_var(--color-plasma-glow)] focus:outline-none transition-all duration-300 font-body"
                  placeholder="you@restaurant.com"
                  required autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-body-xs font-ui text-text-secondary tracking-widest uppercase">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-body-xs text-text-tertiary hover:text-plasma transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password" type={showPassword ? "text" : "password"} name="password"
                    value={formData.password} onChange={handleChange}
                    className="w-full border border-border bg-surface px-4 py-3 pr-12 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_15px_var(--color-plasma-glow)] focus:outline-none transition-all duration-300 font-body"
                    placeholder="••••••••"
                    required autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-plasma transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 border border-border bg-surface checked:bg-plasma/20 checked:border-plasma transition-all duration-300"
                />
                <span className="text-body-xs text-text-tertiary group-hover:text-text-secondary transition-colors">
                  Remember me for 30 days
                </span>
              </label>

               <button
                type="submit" disabled={loading}
                className="relative w-full group overflow-hidden bg-plasma text-void px-6 py-4 font-ui text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_24px_var(--color-plasma)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" /><span>Signing in...</span></>
                ) : (
                  <><LogIn className="w-4 h-4" /><span>Sign In</span></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-body-xs">
                <span className="bg-terminal px-4 text-text-tertiary tracking-widest">OR</span>
              </div>
            </div>

            {/* Create account */}
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full border border-plasma/30 bg-transparent text-plasma px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/10 hover:border-plasma hover:shadow-[0_0_15px_var(--color-plasma-glow)] transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" />
              Create Free Account
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-plasma/30 to-transparent" />
        </div>

        <p className="mt-6 text-center text-body-xs font-body text-text-tertiary">
          Secure login · End-to-end encrypted
        </p>
      </div>
    </div>
  );
}