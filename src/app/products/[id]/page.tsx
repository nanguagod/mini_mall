import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";
import AddToCartButton from "@/components/product/add-to-cart-button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  const outOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑导航 */}
      <nav className="flex items-center gap-2 text-sm text-text-quaternary mb-8">
        <Link href="/" className="hover:text-accent transition-colors">
          首页
        </Link>
        <span>/</span>
        <Link
          href={`/?category=${product.category.slug}`}
          className="hover:text-accent transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* 商品大图 */}
        <div className="aspect-square relative rounded-xl overflow-hidden bg-surface-tertiary shadow-sm">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-overlay flex items-center justify-center">
              <span className="text-white text-lg font-medium bg-overlay-strong px-6 py-2 rounded-lg">
                暂时缺货
              </span>
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-4">
            {product.name}
          </h1>

          {/* 价格和库存 */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl lg:text-4xl font-bold text-danger">
              {formatPrice(product.price)}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                outOfStock
                  ? "text-danger bg-danger-bg"
                  : "text-success bg-success-bg"
              }`}
            >
              <Package className="w-4 h-4" />
              {outOfStock ? "暂时缺货" : `库存 ${product.stock} 件`}
            </span>
          </div>

          {/* 分类信息 */}
          <div className="flex items-center gap-2 mb-6 text-sm text-text-quaternary">
            <span>分类：</span>
            <Link
              href={`/?category=${product.category.slug}`}
              className="text-accent hover:text-accent-hover transition-colors"
            >
              {product.category.name}
            </Link>
          </div>

          {/* 商品描述 */}
          <div className="border-t border-border pt-6 mb-8">
            <h2 className="text-sm font-medium text-text-primary mb-3">商品描述</h2>
            <p className="text-text-secondary leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* 加入购物车按钮 */}
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            outOfStock={outOfStock}
          />
          {outOfStock && (
            <p className="text-xs text-text-tertiary mt-2">
              该商品暂时缺货，请关注后续补货
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return { title: "商品不存在 - Mini Mall" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true },
  });

  if (!product) return { title: "商品不存在 - Mini Mall" };

  return {
    title: `${product.name} - Mini Mall`,
    description: `Mini Mall - ${product.name}`,
  };
}
