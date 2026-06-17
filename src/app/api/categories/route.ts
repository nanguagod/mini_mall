import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/categories
 * 分类列表接口，返回每个分类及其包含的商品数量
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        productCount: cat._count.products,
      }))
    );
  } catch (error) {
    console.error("获取分类列表失败:", error);
    return NextResponse.json(
      { error: "获取分类列表失败，请稍后重试" },
      { status: 500 }
    );
  }
}
