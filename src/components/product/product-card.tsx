import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

// 库存紧张阈值：当库存低于此值时显示"仅剩 N 件"提示
const LOW_STOCK_THRESHOLD = 5;

type ProductCardProps = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
};

export default function ProductCard({ id, name, price, imageUrl, stock }: ProductCardProps) {
  return (
    <Link
      href={`/products/${id}`}
      className="group bg-surface rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      <div className="aspect-square relative overflow-hidden bg-surface-tertiary">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {stock === 0 && (
          <div className="absolute inset-0 bg-overlay flex items-center justify-center">
            <span className="text-white text-sm font-medium bg-overlay-strong px-3 py-1 rounded">
              暂时缺货
            </span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-danger">{formatPrice(price)}</p>
          {stock > 0 && stock <= LOW_STOCK_THRESHOLD && (
            <span className="text-xs text-warning">仅剩 {stock} 件</span>
          )}
        </div>
      </div>
    </Link>
  );
}
