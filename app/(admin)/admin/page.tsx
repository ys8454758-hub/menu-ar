"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Store, Box, CreditCard, Ticket, Search, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AdminStats {
  restaurantsCount: number;
  dishesCount: number;
  scansCount: number;
  activeSubs: number;
  mrr: number;
}

interface RestaurantInfo {
  id: string; name: string; ownerEmail: string; dishesCount: number; scansCount: number; plan: string; isOnMap: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([]);
  const [modelsData, setModelsData] = useState<any[]>([]);
  const [billingData, setBillingData] = useState<any[]>([]);
  const [supportData, setSupportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Client-side quick auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const role = data.session?.user?.user_metadata?.role;
      if (role === "ADMIN") {
        setIsAuthorized(true);
        loadAdminData();
      } else {
        router.push("/dashboard");
      }
    });
  }, [router]);

  async function loadAdminData(tab?: string) {
    setLoading(true);
    try {
      const currentTab = tab || activeTab;
      if (currentTab === "overview" || currentTab === "restaurants") {
        const res = await fetch("/api/admin/overview");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRestaurants(data.restaurants);
        }
      } else if (currentTab === "models") {
        const res = await fetch("/api/admin/models");
        if (res.ok) setModelsData(await res.json());
      } else if (currentTab === "billing") {
        const res = await fetch("/api/admin/billing");
        if (res.ok) setBillingData(await res.json());
      } else if (currentTab === "support") {
        const res = await fetch("/api/admin/support");
        if (res.ok) setSupportData(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    loadAdminData(id);
  };

  if (!isAuthorized) return <div className="min-h-screen bg-void" />; // Wait for redirect

  const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "restaurants", label: "Restaurants", icon: Store },
    { id: "models", label: "3D Models", icon: Box },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "support", label: "Support", icon: Ticket },
  ];

  return (
    <div className="min-h-screen flex text-text-primary bg-void">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-terminal/90 flex-col fixed inset-y-0 z-10 hidden md:flex">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="text-display-sm font-display text-text-accent tracking-widest hover:text-plasma transition-colors">
            Livin<span className="text-plasma">3D</span> <span className="text-body-xs bg-plasma text-void px-1 ml-1 rounded-none">ADMIN</span>
          </Link>
        </div>
        <nav className="flex-1 py-6 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => handleTabChange(id)}
              className={`w-full flex items-center gap-3 px-6 py-3 font-ui text-sm tracking-wider uppercase transition-colors ${
                activeTab === id ? "bg-plasma/10 text-plasma border-r-2 border-plasma" : "text-text-tertiary hover:bg-surface hover:text-text-primary"
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 flex-1 p-4 md:p-8 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-border">
          <Link href="/dashboard" className="text-display-sm font-display text-text-accent tracking-widest">
            Livin<span className="text-plasma">3D</span> <span className="text-body-xs bg-plasma text-void px-1 ml-1 rounded-none">ADMIN</span>
          </Link>
          <select 
            value={activeTab} 
            onChange={(e) => handleTabChange(e.target.value)}
            className="bg-terminal border border-border text-text-primary px-3 py-2 font-ui text-sm uppercase"
          >
            {TABS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-48 bg-terminal" />
            <div className="grid grid-cols-4 gap-4"><div className="h-24 bg-terminal" /><div className="h-24 bg-terminal" /><div className="h-24 bg-terminal" /><div className="h-24 bg-terminal" /></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-display-lg font-display text-text-accent tracking-widest uppercase relative inline-block">
                {TABS.find(t => t.id === activeTab)?.label}
                <div className="absolute -inset-2 bg-plasma/5 blur-xl -z-10" />
              </h1>
            </div>

            {activeTab === "overview" && stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { label: "Restaurants", value: stats.restaurantsCount, color: "text-plasma" },
                    { label: "Total Dishes", value: stats.dishesCount, color: "text-neon-violet" },
                    { label: "Total Scans", value: stats.scansCount, color: "text-success" },
                    { label: "Active Subs", value: stats.activeSubs, color: "text-text-primary" },
                    { label: "MRR", value: `₹${(stats.mrr / 1000).toFixed(1)}k`, color: "text-plasma" },
                  ].map(stat => (
                    <div key={stat.label} className="border border-border bg-terminal p-5 hover:border-plasma/30 transition-colors">
                      <p className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase">{stat.label}</p>
                      <p className={`text-display-md font-display ${stat.color} mt-2`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-6 mt-8">
                  <div className="col-span-2 border border-border bg-terminal p-6">
                    <h2 className="text-body-md font-ui text-text-secondary tracking-widest uppercase mb-4">Recent Activity</h2>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border/50 text-text-tertiary font-ui text-xs tracking-widest uppercase">
                          <th className="pb-3">Restaurant</th>
                          <th className="pb-3">Event</th>
                          <th className="pb-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        <tr><td className="py-3 font-body text-body-sm">Spice Garden</td><td className="py-3 font-body text-body-sm text-plasma">Upgraded to PRO</td><td className="py-3 font-mono text-body-xs text-right text-text-tertiary">10 min ago</td></tr>
                        <tr><td className="py-3 font-body text-body-sm">Lotus Cafe</td><td className="py-3 font-body text-body-sm text-success">Added a new dish</td><td className="py-3 font-mono text-body-xs text-right text-text-tertiary">2 hrs ago</td></tr>
                        <tr><td className="py-3 font-body text-body-sm">Burger Joint</td><td className="py-3 font-body text-body-sm text-neon-violet">Generated QR code</td><td className="py-3 font-mono text-body-xs text-right text-text-tertiary">3 hrs ago</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="border border-border bg-terminal p-6 space-y-4">
                    <h2 className="text-body-md font-ui text-text-secondary tracking-widest uppercase mb-4">System Status</h2>
                    {[
                      { name: "API Server", status: "ok" },
                      { name: "Database", status: "ok" },
                      { name: "Model Processing", status: "warning" },
                    ].map(sys => (
                      <div key={sys.name} className="flex items-center justify-between">
                        <span className="font-ui text-sm text-text-primary">{sys.name}</span>
                        {sys.status === "ok" ? 
                          <span className="flex items-center gap-1.5 text-xs text-success font-mono"><CheckCircle2 className="w-3.5 h-3.5" /> Normal</span> : 
                          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-mono"><AlertCircle className="w-3.5 h-3.5" /> High Load</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "restaurants" && (
              <div className="border border-border bg-terminal">
                <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 border border-border bg-terminal text-sm font-ui text-text-primary focus:border-plasma outline-none" />
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-surface/50">
                    <tr className="border-b border-border text-text-tertiary font-ui text-xs tracking-widest uppercase">
                      <th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4 text-center">Dishes</th><th className="px-6 py-4">Plan</th><th className="px-6 py-4 text-center">On Map (AR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {restaurants.map(r => (
                      <tr key={r.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4 font-body text-body-sm text-text-primary">{r.name}</td>
                        <td className="px-6 py-4 font-mono text-body-xs text-text-tertiary">{r.ownerEmail}</td>
                        <td className="px-6 py-4 font-mono text-body-sm text-center">{r.dishesCount}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs border border-plasma/50 text-plasma font-ui uppercase">{r.plan}</span></td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 text-xs font-ui uppercase border transition-colors ${r.isOnMap ? "border-success bg-success/10 text-success" : "border-border text-text-tertiary"}`}>
                            {r.isOnMap ? "ON" : "OFF"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "models" && (
              <div className="border border-border bg-terminal overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface/50">
                    <tr className="border-b border-border text-text-tertiary font-ui text-xs tracking-widest uppercase">
                      <th className="px-6 py-4">Restaurant</th><th className="px-6 py-4">Dish Name</th><th className="px-6 py-4">Size</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {modelsData.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-text-tertiary font-body">No models found</td></tr> : null}
                    {modelsData.map(m => (
                      <tr key={m.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4 font-body text-body-sm">{m.restaurantName}</td>
                        <td className="px-6 py-4 font-body text-body-sm">{m.dishName}</td>
                        <td className="px-6 py-4 font-mono text-body-xs">{m.size}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs border border-success/50 text-success font-ui uppercase">{m.status}</span></td>
                        <td className="px-6 py-4 font-mono text-body-xs text-text-tertiary">{new Date(m.uploadedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="border border-border bg-terminal overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface/50">
                    <tr className="border-b border-border text-text-tertiary font-ui text-xs tracking-widest uppercase">
                      <th className="px-6 py-4">Restaurant</th><th className="px-6 py-4">Plan</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Period End</th><th className="px-6 py-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {billingData.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-text-tertiary font-body">No subscriptions found</td></tr> : null}
                    {billingData.map(b => (
                      <tr key={b.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4 font-body text-body-sm">{b.restaurantName}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs border border-plasma/50 text-plasma font-ui uppercase">{b.plan}</span></td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs border font-ui uppercase ${b.status === "ACTIVE" ? "border-success/50 text-success" : "border-ember/50 text-ember"}`}>{b.status}</span></td>
                        <td className="px-6 py-4 font-mono text-body-xs">{b.currentPeriodEnd ? new Date(b.currentPeriodEnd).toLocaleDateString() : "N/A"}</td>
                        <td className="px-6 py-4 font-mono text-body-xs text-text-tertiary">{new Date(b.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "support" && (
              <div className="border border-border bg-terminal overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface/50">
                    <tr className="border-b border-border text-text-tertiary font-ui text-xs tracking-widest uppercase">
                      <th className="px-6 py-4">Restaurant</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Priority</th><th className="px-6 py-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {supportData.length === 0 ? <tr><td colSpan={6} className="px-6 py-8 text-center text-text-tertiary font-body">No support tickets found</td></tr> : null}
                    {supportData.map(t => (
                      <tr key={t.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4 font-body text-body-sm">{t.restaurantName}</td>
                        <td className="px-6 py-4 font-body text-body-sm">{t.subject}</td>
                        <td className="px-6 py-4 font-mono text-body-xs text-text-tertiary">{t.category}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs border font-ui uppercase ${t.status === "OPEN" ? "border-amber-400/50 text-amber-400" : "border-success/50 text-success"}`}>{t.status}</span></td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs border font-ui uppercase ${t.priority === "HIGH" ? "border-ember/50 text-ember" : "border-plasma/50 text-plasma"}`}>{t.priority}</span></td>
                        <td className="px-6 py-4 font-mono text-body-xs text-text-tertiary">{new Date(t.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}