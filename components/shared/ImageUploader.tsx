"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  label: string;
  hint: string;
  type: "logo" | "cover" | "banner";
  currentUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  aspectClass?: string; // e.g. "aspect-square" | "aspect-video" | "aspect-[3/1]"
}

export default function ImageUploader({ label, hint, type, currentUrl, onUploadSuccess, aspectClass = "aspect-video" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setError(null);
    setSuccess(false);

    // Local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);

      const res = await fetch("/api/restaurants/images", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        setPreview(currentUrl ?? null);
      } else {
        onUploadSuccess(data.url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch {
      setError("Network error — please try again.");
      setPreview(currentUrl ?? null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-body-xs font-ui text-text-secondary tracking-widest uppercase flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5" />
          {label}
        </label>
        {preview && (
          <button
            type="button"
            onClick={() => { setPreview(null); onUploadSuccess(""); }}
            className="text-body-xs text-text-tertiary hover:text-ember transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer group",
          aspectClass,
          dragOver ? "border-plasma bg-plasma/10" : "border-border bg-surface hover:border-plasma/50 hover:bg-plasma/5"
        )}
      >
        {preview ? (
          <>
            <Image src={preview} alt={label} fill className="object-cover" />
            <div className="absolute inset-0 bg-void/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-text-primary">
                <Upload className="w-6 h-6" />
                <span className="text-body-xs font-ui tracking-widest uppercase">Replace</span>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-plasma animate-spin" />
            ) : (
              <>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  dragOver ? "bg-plasma/20" : "bg-surface-high"
                )}>
                  <Upload className={cn("w-5 h-5", dragOver ? "text-plasma" : "text-text-tertiary")} />
                </div>
                <div>
                  <p className="text-body-sm font-ui text-text-secondary">
                    <span className="text-plasma">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-body-xs font-mono text-text-tertiary mt-1">{hint}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Loading overlay */}
        {uploading && preview && (
          <div className="absolute inset-0 bg-void/70 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-plasma animate-spin" />
          </div>
        )}

        {/* Success flash */}
        {success && (
          <div className="absolute inset-0 bg-success/20 flex items-center justify-center animate-pulse">
            <Check className="w-8 h-8 text-success" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-body-xs font-mono text-ember">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
