"use client";

import { useState } from "react";
import Papa from "papaparse";

interface NutritionBulkImportProps {
  restaurantId: string;
  onSuccess: (result: { imported: number; failed: Array<{ row: number; error: string }> }) => void;
}

export default function NutritionBulkImport({ restaurantId, onSuccess }: NutritionBulkImportProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<Array<Record<string, string>>>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data as Array<Record<string, string>>);
      },
      error: (err) => {
        setError(err.message);
      },
    });
  };

  const handleImport = async () => {
    setUploading(true);
    setError(null);

    try {
      const res = await fetch("/api/nutrition/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, data: preview }),
      });

      const result = await res.json();

      if (res.ok) {
        onSuccess(result);
      } else {
        setError(result.error || "Import failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-border bg-terminal p-6 rounded-none space-y-4">
      <h3 className="text-body-lg font-ui text-text-accent tracking-widest uppercase">Bulk Nutrition Import</h3>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="block text-body-xs font-ui text-text-secondary tracking-wider uppercase">
          CSV File (columns: dishSlug, calories, protein, carbs, fat, fiber, servingSize)
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="w-full text-body-sm font-body text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-ui file:uppercase file:tracking-widest file:bg-plasma/10 file:text-plasma hover:file:bg-plasma/20"
        />
      </div>

      {error && (
        <div className="p-4 border border-ember/50 bg-ember/5 rounded-none">
          <p className="text-body-sm font-body text-ember">{error}</p>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-body-sm font-ui text-text-secondary tracking-wider uppercase">
            Preview ({preview.length} rows)
          </h4>
          <div className="max-h-64 overflow-y-auto border border-border bg-surface rounded-none">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-body-xs font-ui text-text-tertiary tracking-wider uppercase">Dish</th>
                  <th className="px-3 py-2 text-body-xs font-ui text-text-tertiary tracking-wider uppercase">Calories</th>
                  <th className="px-3 py-2 text-body-xs font-ui text-text-tertiary tracking-wider uppercase">Protein</th>
                  <th className="px-3 py-2 text-body-xs font-ui text-text-tertiary tracking-wider uppercase">Carbs</th>
                  <th className="px-3 py-2 text-body-xs font-ui text-text-tertiary tracking-wider uppercase">Fat</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="px-3 py-2 text-body-sm font-body text-text-primary">{row.dishSlug || row.name}</td>
                    <td className="px-3 py-2 text-body-sm font-mono text-plasma">{row.calories || "-"}</td>
                    <td className="px-3 py-2 text-body-sm font-mono text-text-secondary">{row.protein || "-"}</td>
                    <td className="px-3 py-2 text-body-sm font-mono text-text-secondary">{row.carbs || "-"}</td>
                    <td className="px-3 py-2 text-body-sm font-mono text-text-secondary">{row.fat || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 5 && (
              <p className="text-body-xs font-body text-text-tertiary p-2 text-center">
                ... and {preview.length - 5} more rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {preview.length > 0 && (
        <button
          onClick={handleImport}
          disabled={uploading}
          className="w-full rounded-none bg-plasma text-void px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors disabled:opacity-50"
        >
          {uploading ? "Importing..." : `Import ${preview.length} Rows`}
        </button>
      )}
    </div>
  );
}
