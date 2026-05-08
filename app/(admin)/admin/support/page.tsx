"use client";

import SupportTicketList from "@/components/admin/SupportTicketList";

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-md font-display text-text-accent tracking-widest">
          Support Tickets
        </h1>
        <p className="text-body-sm font-body text-text-tertiary mt-1">
          Manage customer support requests
        </p>
      </div>

      <SupportTicketList />
    </div>
  );
}