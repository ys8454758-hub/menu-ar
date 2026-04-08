import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-8 text-center">
      <div className="space-y-6">
        <h1 className="text-display-xl font-display text-text-accent tracking-widest">
          MenuAR
        </h1>
        <p className="text-body-lg font-body text-text-secondary">
          Experience your food in Augmented Reality before you order
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="rounded-none bg-plasma text-void px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/pricing"
            className="rounded-none border border-plasma bg-transparent text-plasma px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/10 transition-colors"
          >
            Pricing
          </Link>
        </div>
      </div>
      
      {/* Scanner animation/visual */}
      <div className="mt-12 w-full max-w-xs">
        <div className="relative h-48 w-full rounded-none border-2 border-border">
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-1 bg-grid/20">
            {/* Grid lines */}
            {[...Array(12)].map((_, i) => (
              <div key={`col-${i}`} className="col-start-1 col-end-13 row-start-1 row-end-7 bg-grid/10" />
            ))}
            {[...Array(6)].map((_, i) => (
              <div key={`row-${i}`} className="col-start-1 col-end-13 row-start-{i + 1} row-end-{i + 2} bg-grid/10" />
            ))}
            
            {/* Scanner line */}
            <div className="col-start-1 col-end-13 row-start-1 row-end-2 bg-plasma/50 h-0.5" />
          </div>
          
          {/* Placeholder for dish */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2 text-center">
              <div className="w-16 h-16 border-2 border-plasma/50 rounded-none flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-plasma rounded-none flex items-center justify-center">
                  <div className="w-6 h-6 bg-plasma/20" />
                </div>
              </div>
              <p className="text-body-sm font-body text-text-secondary">
                Scan to view in AR
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="mt-12 w-full max-w-2xl space-y-6">
        <h2 className="text-display-lg font-display text-text-accent tracking-wider">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="space-y-3">
              <div className="w-10 h-10 rounded-none border-2 border-plasma flex items-center justify-center">
                <span className="font-display text-plasma text-body-lg">{step}</span>
              </div>
              <h3 className="text-body-md font-body text-text-primary">
                {step === 1 && "Upload Dish"}
                {step === 2 && "Design QR"}
                {step === 3 && "Customer Scans"}
              </h3>
              <p className="text-body-xs font-body text-text-secondary">
                {step === 1 && "Restaurant owners upload 3D dish models"}
                {step === 2 && "Create branded QR codes for tables"}
                {step === 3 && "Customers see dishes in AR before ordering"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}