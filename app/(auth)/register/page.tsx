import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-8">
      <div className="space-y-8 w-full max-w-md">
        <h1 className="text-display-lg font-display text-text-accent tracking-widest">
          Create Account
        </h1>
        
        {/* Registration form would go here */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-body-sm font-body text-text-secondary">
              Full Name
            </label>
            <input
              type="text"
              className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_10px_var(--color-plasma-glow)]"
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-body-sm font-body text-text-secondary">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_10px_var(--color-plasma-glow)]"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-body-sm font-body text-text-secondary">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_10px_var(--color-plasma-glow)]"
              placeholder="Create password"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-body-sm font-body text-text-secondary">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_10px_var(--color-plasma-glow)]"
              placeholder="Confirm password"
            />
          </div>
          
          <button className="w-full rounded-none bg-plasma text-void px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors">
            Create Account
          </button>
          
          <p className="text-body-xs font-body text-text-tertiary">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
        
        <div className="border-t border-border pt-6">
          <p className="text-body-sm font-body text-text-secondary">
            Already have an account?
            <Link href="/auth/login" className="text-text-accent hover:text-plasma/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}