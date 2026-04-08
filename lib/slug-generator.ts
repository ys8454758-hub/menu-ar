import prisma from "./prisma";

export async function generateUniqueSlug(name: string): Promise<string> {
  // Convert to lowercase, replace non-alphanumeric with hyphens
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Check if slug exists and add number if needed
  let slug = baseSlug;
  let counter = 0;
  
  while (true) {
    const existing = await prisma.restaurant.findUnique({
      where: { slug },
    });
    
    if (!existing) {
      return slug;
    }
    
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}