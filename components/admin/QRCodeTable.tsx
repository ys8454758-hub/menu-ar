"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Eye, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRCode {
  id: string;
  dishId: string;
  dish: {
    name: string;
    restaurant: {
      name: string;
      slug: string;
    };
  };
  uniqueCode: string;
  isActive: boolean;
  scanCount: number;
  lastScannedAt: string | null;
  createdAt: string;
}

interface QRCodeTableProps {
  className?: string;
}

export default function QRCodeTable({ className }: QRCodeTableProps) {
  const [codes, setCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const res = await fetch("/api/admin/qr-codes");
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      }
    } catch (err) {
      console.error("Failed to fetch QR codes:", err);
    } finally {
      setLoading(false);
    }
  };

  const deactivateCode = async (codeId: string) => {
    try {
      await fetch(`/api/admin/qr-codes/${codeId}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: false }),
      });
      fetchQRCodes();
    } catch (err) {
      console.error("Failed to deactivate QR:", err);
    }
  };

  const filteredCodes = codes.filter((c) => {
    const matchesSearch =
      c.dish.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dish.restaurant.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && c.isActive) ||
      (filter === "inactive" && !c.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-border bg-surface text-text-primary"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-2 text-body-xs font-ui uppercase tracking-wider",
                filter === f
                  ? "border border-plasma text-plasma"
                  : "border border-border text-text-secondary hover:border-plasma/50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={fetchQRCodes}
          className="p-2 border border-border hover:border-plasma/50 text-text-secondary"
        >
          <RefreshCw className="w-4 h-4" />
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
                  Dish
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Scans
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Last Scan
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCodes.map((code) => (
                <tr key={code.id} className="border-b border-border hover:bg-surface/50">
                  <td className="px-4 py-3 text-body-sm font-body text-text-secondary">
                    {code.dish.restaurant.name}
                  </td>
                  <td className="px-4 py-3 text-body-sm font-ui text-text-accent">
                    {code.dish.name}
                  </td>
                  <td className="px-4 py-3 text-body-xs font-mono text-text-tertiary">
                    {code.uniqueCode.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-body-sm font-mono text-text-secondary">
                    {code.scanCount}
                  </td>
                  <td className="px-4 py-3 text-body-sm font-body text-text-tertiary">
                    {code.lastScannedAt
                      ? new Date(code.lastScannedAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-body-xs font-ui uppercase tracking-wider",
                        code.isActive
                          ? "border border-success/50 text-success"
                          : "border border-ember/50 text-ember"
                      )}
                    >
                      {code.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="p-1 text-text-secondary hover:text-plasma">
                        <Eye className="w-4 h-4" />
                      </button>
                      {!code.isActive && (
                        <button
                          onClick={() => deactivateCode(code.id)}
                          className="p-1 text-text-secondary hover:text-ember"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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