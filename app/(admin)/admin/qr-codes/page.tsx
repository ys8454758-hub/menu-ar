"use client";

import QRCodeTable from "@/components/admin/QRCodeTable";

export default function AdminQRCodesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-md font-display text-text-accent tracking-widest">
          QR Codes
        </h1>
        <p className="text-body-sm font-body text-text-tertiary mt-1">
          Manage all QR codes across restaurants
        </p>
      </div>

      <QRCodeTable />
    </div>
  );
}