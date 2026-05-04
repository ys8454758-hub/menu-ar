import Sidebar from "@/components/shared/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-[72px]">
        <nav className="bg-terminal/80 backdrop-blur-sm border-r border-border h-16">
          <div className="flex h-full w-full items-center px-6">
            <h1 className="text-display-md font-display text-text-accent tracking-wider">
              Dashboard
            </h1>
          </div>
        </nav>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}