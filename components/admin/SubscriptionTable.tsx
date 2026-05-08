"use client";

import { useState, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subscription {
  id: string;
  restaurant: {
    name: string;
    slug: string;
  };
  plan: "STARTER" | "GROWTH" | "PRO";
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "TRIALING";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

interface SubscriptionTableProps {
  className?: string;
}

const PLAN_COLORS: Record<string, string> = {
  STARTER: "text-text-secondary",
  GROWTH: "text-neon-violet",
  PRO: "text-plasma",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "text-success",
  PAST_DUE: "text-amber-400",
  CANCELLED: "text-ember",
  TRIALING: "text-neon-violet",
};

export default function SubscriptionTable({ className }: SubscriptionTableProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/admin/billing");
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Restaurant", "Plan", "Status", "Period End", "Created"].join(","),
      ...subscriptions.map((s) =>
        [
          s.restaurant.name,
          s.plan,
          s.status,
          s.currentPeriodEnd || "",
          s.createdAt,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscriptions.csv";
    a.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-end gap-2">
        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-2 px-4 py-2 border border-border text-text-secondary hover:border-plasma/50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-border text-text-secondary hover:border-plasma/50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-tertiary">Loading...</div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Period End
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Auto-Renew
                </th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-border hover:bg-surface/50">
                  <td className="px-4 py-3 text-body-sm font-ui text-text-accent">
                    {sub.restaurant.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-body-sm font-ui uppercase tracking-wider",
                        PLAN_COLORS[sub.plan]
                      )}
                    >
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-body-xs font-ui uppercase tracking-wider",
                        STATUS_COLORS[sub.status]
                      )}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body-sm font-body text-text-secondary">
                    {sub.currentPeriodEnd
                      ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-body-xs font-body",
                        sub.cancelAtPeriodEnd ? "text-ember" : "text-success"
                      )}
                    >
                      {sub.cancelAtPeriodEnd ? "Cancels" : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}