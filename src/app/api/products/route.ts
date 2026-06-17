import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/products
 * 商品列表接口，支持搜索、分类筛选、分页
 *
 * 查询参数:
 *   q        — 模糊搜索（商品名称）
 *   category — 按分类 slug 筛选
 *   page     — 页码（默认 1，每页 9 条）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = 9;

    // 构建 Prisma 查询条件
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

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          imageUrl: true,
          stock: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("获取商品列表失败:", error);
    return NextResponse.json(
      { error: "获取商品列表失败，请稍后重试" },
      { status: 500 }
    );
  }
}
