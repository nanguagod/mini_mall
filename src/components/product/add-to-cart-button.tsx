"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";

type Props = {
  productId: number;
  productName: string;
  outOfStock: boolean;
};

export default function AddToCartButton({ productId, productName, outOfStock }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAddToCart() {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/login?callbackUrl=/products/${productId}`);
          return;
        }
        toast.error(data.error || "加入购物车失败");
        return;
      }

      toast.success(`${productName} 已加入购物车`);
      router.refresh();
    } catch {
      toast.error("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={outOfStock || loading}
      className="flex items-center justify-center gap-2 w-full sm:w-64 px-8 py-3.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover disabled:bg-surface-tertiary disabled:cursor-not-allowed transition-colors shadow-sm"
    >
      <ShoppingCart className="w-5 h-5" />
      {loading ? "添加中..." : outOfStock ? "暂时缺货" : "加入购物车"}
    </button>
  );
}
