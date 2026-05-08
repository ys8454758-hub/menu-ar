export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) return;

  const headers = columns
    ? columns.map((c) => c.label)
    : Object.keys(data[0]);

  const keys = columns
    ? columns.map((c) => c.key)
    : (Object.keys(data[0]) as (keyof T)[]);

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      keys
        .map((key) => {
          const value = row[key];
          const stringValue = value === null || value === undefined ? "" : String(value);
          return stringValue.includes(",") || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportToJSON<T>(data: T, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}