export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
