"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRRedirectManagerProps {
  qrCodeId: string;
  currentRedirectUrl: string | null;
  onSave: (redirectUrl: string | null) => Promise<void>;
  className?: string;
}

export default function QRRedirectManager({
  qrCodeId: _qrCodeId,
  currentRedirectUrl,
  onSave,
  className,
}: QRRedirectManagerProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void _qrCodeId; // kept for future use
  const [redirectUrl, setRedirectUrl] = useState(currentRedirectUrl || "");
  const [saving, setSaving] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(redirectUrl.trim() || null);
      setShowInput(false);
    } catch (err) {
      console.error("Failed to save redirect:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await onSave(null);
      setRedirectUrl("");
      setShowInput(false);
    } catch (err) {
      console.error("Failed to clear redirect:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!showInput && !currentRedirectUrl) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className={cn(
          "text-body-xs font-ui text-text-secondary hover:text-plasma",
          className
        )}
      >
        + Add Redirect
      </button>
    );
  }

  if (!showInput && currentRedirectUrl) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-body-xs text-text-tertiary truncate max-w-[150px]">
          → {currentRedirectUrl}
        </span>
        <button
          onClick={() => setShowInput(true)}
          className="text-body-xs text-text-secondary hover:text-plasma"
        >
          Edit
        </button>
        <button
          onClick={handleClear}
          className="text-body-xs text-ember hover:text-ember/80"
        >
          Clear
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="url"
        value={redirectUrl}
        onChange={(e) => setRedirectUrl(e.target.value)}
        placeholder="https://example.com or /ar/dish"
        className="flex-1 px-2 py-1 border border-border bg-surface text-text-primary text-body-xs"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="p-1 text-plasma hover:text-plasma/80"
      >
        <Save className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          setShowInput(false);
          setRedirectUrl(currentRedirectUrl || "");
        }}
        className="p-1 text-text-tertiary hover:text-text-secondary"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}