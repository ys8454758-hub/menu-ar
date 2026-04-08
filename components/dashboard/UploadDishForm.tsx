"use client";

import { useState } from "react";

interface UploadDishFormProps {
  restaurantId: string;
}

export default function UploadDishForm({ restaurantId }: UploadDishFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/dishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price: price ? parseFloat(price) : null,
          category,
          imageUrl,
          restaurantId,
        }),
      });

      if (response.ok) {
        // Reset form
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setImageUrl("");
        alert("Dish created successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating dish:", error);
      alert("Failed to create dish. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="text-body-sm font-body text-text-secondary">
          Dish Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter dish name"
          className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_10px_var(--color-plasma-glow)]"
        />
      </div>
      
      <div className="space-y-3">
        <label className="text-body-sm font-body text-text-secondary">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter dish description"
          rows={4}
          className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_10px_var(--color-plasma-glow)]"
        />
      </div>
      
      <div className="space-y-3">
        <label className="text-body-sm font-body text-text-secondary">
          Price ($)
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_10px_var(--color-plasma-glow)]"
        />
      </div>
      
      <div className="space-y-3">
        <label className="text-body-sm font-body text-text-secondary">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_10px_var(--color-plasma-glow)]"
        >
          <option value="">Select category</option>
          <option value="appetizer">Appetizer</option>
          <option value="main">Main Course</option>
          <option value="dessert">Dessert</option>
          <option value="beverage">Beverage</option>
        </select>
      </div>
      
      <div className="space-y-3">
        <label className="text-body-sm font-body text-text-secondary">
          Image URL
        </label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_10px_var(--color-plasma-glow)]"
        />
      </div>
      
      <button
        type="submit"
        className="w-full rounded-none bg-plasma text-void px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors"
      >
        Add Dish
      </button>
    </form>
  );
}