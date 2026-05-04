import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen   flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="text-plasma text-display-xl font-display tracking-widest">404</div>
        <p className="text-text-secondary font-body text-body-md">Page not found</p>
        <Link href="/" className="inline-block bg-plasma text-void px-6 py-3 font-ui text-sm tracking-widest uppercase">Return Home</Link>
      </div>
    </div>
  );
}
