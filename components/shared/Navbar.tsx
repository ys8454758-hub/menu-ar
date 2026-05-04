import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-terminal/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0">
              <span className="block text-xl font-display text-plasma tracking-widest mt-[20px]">
                Livin3D
              </span>
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="text-text-secondary hover:text-text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-text-secondary hover:text-text-primary transition-colors">
              About
            </Link>
          </div>
          <div className="flex items-center">
            <Link
              href="/register"
              className="rounded-md bg-plasma text-void px-4 py-2 text-sm font-ui tracking-widest uppercase hover:bg-plasma/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}