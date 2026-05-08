import { describe, it, expect } from "vitest";

describe("CSV Generation", () => {
  it("should generate CSV from array of objects", () => {
    const data = [
      { id: 1, name: "Dish 1", price: 100 },
      { id: 2, name: "Dish 2", price: 200 },
    ];

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        Object.values(row)
          .map((v) => (v === null || v === undefined ? "" : String(v)))
          .join(",")
      ),
    ].join("\n");

    expect(csvContent).toContain("id,name,price");
    expect(csvContent).toContain("1,Dish 1,100");
    expect(csvContent).toContain("2,Dish 2,200");
  });

  it("should handle custom columns", () => {
    const data = [{ id: 1, name: "Dish 1", hidden: "secret" }];
    const columns = [
      { key: "name" as const, label: "Dish Name" },
      { key: "id" as const, label: "ID" },
    ];

    const headers = columns.map((c) => c.label);
    const keys = columns.map((c) => c.key);

    const csvContent = [
      headers.join(","),
      data.map((row) => keys.map((key) => String(row[key])).join(",")).join("\n"),
    ].join("\n");

    expect(csvContent).toContain("Dish Name,ID");
    expect(csvContent).toContain("Dish 1,1");
    expect(csvContent).not.toContain("secret");
  });

  it("should escape CSV values with commas", () => {
    const data = [{ name: "Dish, with comma" }];
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        Object.values(row)
          .map((v) => {
            const s = String(v || "");
            return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(",")
      ),
    ].join("\n");

    expect(csvContent).toContain('"Dish, with comma"');
  });
});

describe("JSON Generation", () => {
  it("should stringify data to JSON", () => {
    const data = { name: "Dish 1", price: 100 };
    const jsonContent = JSON.stringify(data, null, 2);

    expect(jsonContent).toContain('"name": "Dish 1"');
    expect(jsonContent).toContain('"price": 100');
  });
});