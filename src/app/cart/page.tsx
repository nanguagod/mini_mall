"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { ShoppingCart, Trash2, ArrowLeft, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { CartItemWithProduct } from "@/types";
import QuantityControl from "@/components/cart/quantity-control";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  // 加载购物车数据
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login?callbackUrl=/cart");
          return;
        }
        throw new Error("获取购物车失败");
      }
      const data = await res.json();
      setItems(data.items);
    } catch {
      toast.error("获取购物车失败");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 调整数量
  async function handleUpdateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity < 0) return;

    setUpdatingIds((prev) => new Set(prev).add(itemId));

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "更新失败");
        // 重新加载以恢复正确状态
        fetchCart();
        return;
      }

      // 如果数量为 0，从列表中移除
      if (newQuantity === 0) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        const data = await res.json();
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? data.item : item
          )
        );
      }
    } catch {
      toast.error("网络错误，请稍后重试");
      fetchCart();
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }

  // 删除购物车项
  async function handleDelete(itemId: number) {
    setUpdatingIds((prev) => new Set(prev).add(itemId));

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("删除失败");
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success("已移除");
    } catch {
      toast.error("网络错误，请稍后重试");
      fetchCart();
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }

  // 提交订单
  async function handleCheckout() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "创建订单失败");
        return;
      }

      toast.success("订单创建成功！");
      setItems([]);
      router.push(`/orders/${data.order.id}`);
      router.refresh();
    } catch {
      toast.error("网络错误，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  // 计算总价
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // 加载中
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-surface-tertiary rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // 购物车为空
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-text-tertiary opacity-50" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">购物车是空的</h2>
          <p className="text-text-quaternary mb-6">快去选购心仪的商品吧</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            去逛逛
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">购物车</h1>
        <span className="text-sm text-text-quaternary">
          共 {totalCount} 件商品
        </span>
      </div>

      {/* 购物车列表 */}
      <div className="space-y-4">
        {items.map((item) => {
          const isUpdating = updatingIds.has(item.id);
          const outOfStock = item.product.stock === 0;

          return (
            <div
              key={item.id}
              className={`bg-surface rounded-xl border border-border p-4 sm:p-5 flex gap-4 sm:gap-6 transition-opacity ${
                isUpdating ? "opacity-60" : ""
              }`}
            >
              {/* 商品图片 */}
              <Link
                href={`/products/${item.product.id}`}
                className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-lg overflow-hidden bg-surface-tertiary flex-shrink-0"
              >
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </Link>

              {/* 商品信息 */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.id}`}
                  className="text-sm sm:text-base font-medium text-text-primary hover:text-accent transition-colors line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-text-quaternary mt-1">
                  {formatPrice(item.product.price)}
                </p>

                {/* 库存状态 */}
                {outOfStock ? (
                  <p className="text-xs text-danger mt-1 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    暂时缺货
                  </p>
                ) : item.product.stock <= 5 ? (
                  <p className="text-xs text-warning mt-1">
                    仅剩 {item.product.stock} 件
                  </p>
                ) : null}

                {/* 数量和操作 */}
                <div className="flex items-center justify-between mt-3">
                  <QuantityControl
                    quantity={item.quantity}
                    stock={item.product.stock}
                    disabled={isUpdating || outOfStock}
                    onDecrease={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    onIncrease={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  />

                  {/* 小计和删除 */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-sm sm:text-base font-semibold text-text-primary">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isUpdating}
                      className="text-text-tertiary hover:text-danger transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部结算栏 */}
      <div className="mt-8 bg-surface rounded-xl border border-border p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-secondary">
            共 {totalCount} 件商品
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-text-secondary">合计：</span>
            <span className="text-2xl font-bold text-danger">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            继续购物
          </Link>
          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="flex-1 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover disabled:bg-surface-tertiary disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "提交中..." : "提交订单"}
          </button>
        </div>
      </div>
    </div>
  );
}
