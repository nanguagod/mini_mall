import prisma from "@/lib/prisma";
import ProductCard from "@/components/product/product-card";
import Link from "next/link";
import { Search } from "lucide-react";

type Props = {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || "";
  const categorySlug = params.category || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 9;

  // 构建查询条件
  const where: { name?: { contains: string }; categoryId?: number } = {};
  if (q) {
    where.name = { contains: q };
  }
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });
    if (category) {
      where.categoryId = category.id;
    }
  }

  // 并行获取商品数据、总数、分类列表
  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        stock: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // 构建带参 URL
  const buildUrl = (newPage: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (categorySlug) sp.set("category", categorySlug);
    if (newPage > 1) sp.set("page", String(newPage));
    const qs = sp.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 搜索框 */}
      <div className="mb-8">
        <form action="/" method="GET" className="relative max-w-xl mx-auto">
          {categorySlug && (
            <input type="hidden" name="category" value={categorySlug} />
          )}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="搜索商品名称..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-surface shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
        </form>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <Link
          href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !categorySlug
              ? "bg-accent text-white shadow-sm"
              : "bg-surface text-text-secondary hover:bg-surface-tertiary border border-border"
          }`}
        >
          全部
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={
              categorySlug === cat.slug
                ? buildUrl(1)
                : `/?category=${cat.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`
            }
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categorySlug === cat.slug
                ? "bg-accent text-white shadow-sm"
                : "bg-surface text-text-secondary hover:bg-surface-tertiary border border-border"
            }`}
          >
            {cat.name}
            <span className="ml-1 text-xs opacity-75">({cat._count.products})</span>
          </Link>
        ))}
      </div>

      {/* 搜索结果提示 */}
      {q && (
        <p className="text-center text-text-quaternary mb-6">
          搜索 &ldquo;{q}&rdquo; — 共找到 {total} 件商品
        </p>
      )}

      {/* 商品网格 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-text-tertiary">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无匹配商品</p>
          <p className="mt-1">请尝试其他搜索条件或分类</p>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <nav className="flex justify-center items-center gap-2 mt-12">
          {page > 1 && (
            <Link
              href={buildUrl(page - 1)}
              className="px-4 py-2 text-sm rounded-lg border border-border bg-surface hover:bg-surface-tertiary transition-colors"
            >
              上一页
            </Link>
          )}

          {generatePageNumbers(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2 text-text-tertiary select-none">
                ...
              </span>
            ) : (
              <Link
                key={p}
                href={buildUrl(p as number)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  p === page
                    ? "bg-accent text-white shadow-sm"
                    : "border border-border bg-surface hover:bg-surface-tertiary"
                }`}
              >
                {p}
              </Link>
            )
          )}

          {page < totalPages && (
            <Link
              href={buildUrl(page + 1)}
              className="px-4 py-2 text-sm rounded-lg border border-border bg-surface hover:bg-surface-tertiary transition-colors"
            >
              下一页
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

/**
 * 生成分页页码数组，用 "..." 表示省略
 * 例如: [1, "...", 4, 5, 6, "...", 10]
 */
function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  if (total > 1) {
    pages.push(total);
  }

  return pages;
}
