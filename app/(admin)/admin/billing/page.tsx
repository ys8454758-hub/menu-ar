"use client";

import SubscriptionTable from "@/components/admin/SubscriptionTable";

export default function AdminBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-md font-display text-text-accent tracking-widest">
          Billing
        </h1>
        <p className="text-body-sm font-body text-text-tertiary mt-1">
          Manage subscriptions and payments
        </p>
      </div>

      <SubscriptionTable />
    </div>
  );
}