"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, UserPlus, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "",
    fullName: "",
    restaurantName: "",
    slug: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    
    // Auto-generate slug from restaurant name
    if (name === "restaurantName" && !formData.slug) {
      newFormData.slug = value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    }
    
    setFormData(newFormData);
  };

  const passwordStrength = (() => {
    const p = formData.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", color: "bg-ember", width: "w-1/4" };
    if (p.length < 8) return { label: "Weak", color: "bg-amber-400", width: "w-2/4" };
    if (!/[^a-zA-Z0-9]/.test(p)) return { label: "Moderate", color: "bg-plasma", width: "w-3/4" };
    return { label: "Strong", color: "bg-success", width: "w-full" };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const { email, password, confirmPassword, fullName, restaurantName, slug } = formData;
    
    if (!email.trim() || !password || !confirmPassword || !fullName.trim() || !restaurantName.trim() || !slug.trim()) {
      setError("Please fill in all fields"); return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match"); return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }

    setLoading(true);
    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName }
        },
      });

      if (authError) { setError(`Registration failed: ${authError.message}`); return; }
      if (!authData.user) { setError("Failed to create auth session"); return; }

      // 2. Create Prisma records (User + Restaurant)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: fullName,
          restaurantName,
          slug,
          userId: authData.user.id
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error || "Failed to create restaurant profile");
        // Optional: Clean up supabase user if prisma fails? 
        // Better to let them re-try or handle via sync
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(`Registration failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-violet/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-plasma/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <h1 className="text-display-xl font-display text-text-accent tracking-widest group-hover:text-plasma transition-colors">
              Livin3D
            </h1>
          </Link>
          <p className="mt-3 text-body-md font-body text-text-secondary">
            Create your restaurant account and start building
          </p>
          <div className="mt-2 w-24 h-0.5 bg-gradient-to-r from-transparent via-neon-violet to-transparent mx-auto" />
        </div>

        <div className="relative bg-terminal/80 backdrop-blur-sm border border-border overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neon-violet to-transparent" />

          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-ember/10 border border-ember/30 border-l-2 border-l-ember p-4 flex items-start gap-3">
                <span className="text-ember text-lg leading-none mt-0.5">⚠</span>
                <p className="text-body-sm font-body text-ember">{error}</p>
              </div>
            )}

            {success ? (
              <div className="py-8 flex flex-col items-center gap-4 text-center">
                <CheckCircle className="w-14 h-14 text-success" />
                <h2 className="text-body-lg font-ui text-text-primary tracking-wider">Account Created!</h2>
                <p className="text-body-sm font-body text-text-secondary">Check your email to confirm, then log in.</p>
                <div className="w-full h-1 bg-surface overflow-hidden">
                  <div className="h-full bg-success animate-[loading_2.5s_linear_forwards]" style={{ width: "100%" }} />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="reg-name" className="text-body-xs font-ui text-text-secondary tracking-widest uppercase block">
                    Full Name
                  </label>
                  <input
                    id="reg-name" type="text" name="fullName"
                    value={formData.fullName} onChange={handleChange}
                    className="w-full border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-neon-violet focus:shadow-[0_0_15px_var(--color-neon-violet-dim)] focus:outline-none transition-all duration-300 font-body"
                    placeholder="E.g. John Doe"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="reg-email" className="text-body-xs font-ui text-text-secondary tracking-widest uppercase block">
                    Work Email
                  </label>
                  <input
                    id="reg-email" type="email" name="email"
                    value={formData.email} onChange={handleChange}
                    className="w-full border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-neon-violet focus:shadow-[0_0_15px_var(--color-neon-violet-dim)] focus:outline-none transition-all duration-300 font-body"
                    placeholder="you@restaurant.com"
                    required autoComplete="email"
                  />
                </div>

                {/* Restaurant Name */}
                <div className="space-y-2">
                  <label htmlFor="reg-rest-name" className="text-body-xs font-ui text-text-secondary tracking-widest uppercase block">
                    Restaurant Name
                  </label>
                  <input
                    id="reg-rest-name" type="text" name="restaurantName"
                    value={formData.restaurantName} onChange={handleChange}
                    className="w-full border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-neon-violet focus:shadow-[0_0_15px_var(--color-neon-violet-dim)] focus:outline-none transition-all duration-300 font-body"
                    placeholder="E.g. The Grand Bistro"
                    required
                  />
                </div>

                {/* URL Slug */}
                <div className="space-y-2">
                  <label htmlFor="reg-slug" className="text-body-xs font-ui text-text-secondary tracking-widest uppercase block">
                    Custom URL Slug
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-body text-sm select-none">
                      livin3d.com/ar/
                    </span>
                    <input
                      id="reg-slug" type="text" name="slug"
                      value={formData.slug} onChange={handleChange}
                      className="w-full border border-border bg-surface pl-[105px] pr-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-neon-violet focus:shadow-[0_0_15px_var(--color-neon-violet-dim)] focus:outline-none transition-all duration-300 font-body"
                      placeholder="your-restaurant"
                      required
                    />
                  </div>
                  <p className="text-[10px] font-body text-text-tertiary mt-1 italic">This will be your permanent menu link.</p>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="reg-password" className="text-body-xs font-ui text-text-secondary tracking-widest uppercase block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password" type={showPassword ? "text" : "password"} name="password"
                      value={formData.password} onChange={handleChange}
                      className="w-full border border-border bg-surface px-4 py-3 pr-12 text-text-primary placeholder:text-text-tertiary focus:border-neon-violet focus:shadow-[0_0_15px_var(--color-neon-violet-dim)] focus:outline-none transition-all duration-300 font-body"
                      placeholder="Min. 6 characters"
                      required autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-neon-violet transition-colors p-1">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {passwordStrength && (
                    <div className="space-y-1">
                      <div className="h-1 bg-surface w-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${passwordStrength.color} ${passwordStrength.width}`} />
                      </div>
                      <p className={`text-body-xs font-ui tracking-wider ${
                        passwordStrength.label === "Strong" ? "text-success" :
                        passwordStrength.label === "Moderate" ? "text-plasma" :
                        passwordStrength.label === "Weak" ? "text-amber-400" : "text-ember"
                      }`}>{passwordStrength.label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="reg-confirm" className="text-body-xs font-ui text-text-secondary tracking-widest uppercase block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirm" type={showConfirm ? "text" : "password"} name="confirmPassword"
                      value={formData.confirmPassword} onChange={handleChange}
                      className="w-full border border-border bg-surface px-4 py-3 pr-12 text-text-primary placeholder:text-text-tertiary focus:border-neon-violet focus:shadow-[0_0_15px_var(--color-neon-violet-dim)] focus:outline-none transition-all duration-300 font-body"
                      placeholder="Repeat password"
                      required autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-neon-violet transition-colors p-1">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-body-xs text-ember">Passwords don&apos;t match</p>
                  )}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox"
                    className="mt-0.5 h-4 w-4 flex-shrink-0 border border-border bg-surface checked:bg-neon-violet/20 checked:border-neon-violet transition-all duration-300"
                    required
                  />
                  <span className="text-body-xs text-text-tertiary group-hover:text-text-secondary transition-colors leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-text-accent hover:text-neon-violet transition-colors underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-text-accent hover:text-neon-violet transition-colors underline">Privacy Policy</Link>
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  className="relative w-full group overflow-hidden bg-neon-violet text-void px-6 py-4 font-ui text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_24px_var(--color-neon-violet-dim)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" /><span>Creating Account...</span></>
                  ) : (
                    <><UserPlus className="w-4 h-4" /><span>Create Free Account</span></>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neon-violet/30 to-transparent" />
        </div>

        {!success && (
          <p className="mt-6 text-center text-body-xs font-body text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-text-accent hover:text-plasma transition-colors underline">
              Sign in here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}