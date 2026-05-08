"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupportTicket {
  id: string;
  subject: string;
  category: "GENERAL" | "BILLING" | "TECHNICAL" | "MODEL_QUALITY" | "QR_ISSUE";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  restaurant: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SupportTicketListProps {
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "text-neon-violet",
  IN_PROGRESS: "text-amber-400",
  RESOLVED: "text-success",
  CLOSED: "text-text-tertiary",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-text-tertiary",
  NORMAL: "text-text-secondary",
  HIGH: "text-amber-400",
  URGENT: "text-ember",
};

export default function SupportTicketList({ className }: SupportTicketListProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/admin/support");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    return statusFilter === "all" || t.status === statusFilter;
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-2">
        {["all", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-2 text-body-xs font-ui uppercase tracking-wider",
              statusFilter === s
                ? "border border-plasma text-plasma"
                : "border border-border text-text-secondary hover:border-plasma/50"
            )}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-tertiary">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-border overflow-hidden">
            <div className="bg-surface border-b border-border px-4 py-2">
              <h3 className="text-body-sm font-ui text-text-secondary uppercase tracking-wider">
                Tickets ({filteredTickets.length})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={cn(
                    "w-full px-4 py-3 text-left border-b border-border hover:bg-surface/50 transition-colors",
                    selectedTicket?.id === ticket.id && "bg-surface"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-ui text-text-accent truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-body-xs font-body text-text-tertiary">
                        {ticket.restaurant.name}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-body-xs font-ui uppercase tracking-wider shrink-0",
                        STATUS_COLORS[ticket.status]
                      )}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-body-xs text-text-tertiary">
                      {ticket.category}
                    </span>
                    <span className={cn("text-body-xs", PRIORITY_COLORS[ticket.priority])}>
                      {ticket.priority}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-border overflow-hidden">
            {selectedTicket ? (
              <>
                <div className="bg-surface border-b border-border px-4 py-3">
                  <h3 className="text-body-md font-ui text-text-accent">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-body-xs font-body text-text-tertiary">
                    {selectedTicket.restaurant.name} •{" "}
                    {new Date(selectedTicket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                  <p className="text-body-sm font-body text-text-secondary">
                    Conversation thread will appear here...
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-plasma text-void px-4 py-2 font-ui text-sm">
                      Reply
                    </button>
                    <select className="border border-border bg-surface px-3 py-2 text-body-sm">
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-text-tertiary">
                <MessageSquare className="w-8 h-8 mb-2" />
                <p className="text-body-sm">Select a ticket to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}