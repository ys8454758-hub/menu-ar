"use client";

import { useState } from "react";

interface QRRedirectManagerProps {
  qrCodeId: string;
  currentRedirect: string | null;
  dishName: string;
  onSave: (redirectUrl: string) => Promise<void>;
}

export default function QRRedirectManager({ currentRedirect, dishName, onSave }: QRRedirectManagerProps) {
  const [redirectUrl, setRedirectUrl] = useState(currentRedirect || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(redirectUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-border bg-terminal p-6 rounded-none space-y-4">
      <h3 className="text-body-lg font-ui text-text-accent tracking-widest uppercase">
        QR Redirect: {dishName}
      </h3>

      <div className="space-y-2">
        <label className="block text-body-xs font-ui text-text-secondary tracking-wider uppercase">
          Redirect URL (when dish is archived/unavailable)
        </label>
        <input
          type="url"
          value={redirectUrl}
          onChange={(e) => setRedirectUrl(e.target.value)}
          placeholder="/ar/restaurant/other-dish or https://example.com"
          className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary font-mono text-sm outline-none focus:border-plasma"
        />
        <p className="text-body-xs font-body text-text-tertiary">
          Leave empty to show &quot;dish not found&quot; message. Users scanning the QR will be redirected here.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-none bg-plasma text-void px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Redirect"}
      </button>
    </div>
  );
}
