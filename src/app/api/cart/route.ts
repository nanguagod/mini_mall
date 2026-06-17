import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * GET /api/cart — 获取当前用户的购物车列表
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            imageUrl: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("获取购物车失败:", error);
    return NextResponse.json(
      { error: "获取购物车失败，请稍后重试" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart — 加入购物车
 * Body: { productId: number, quantity: number }
 * 如果商品已在购物车中，增加数量
 * 检查库存是否充足
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    // 校验参数
    if (!productId || typeof productId !== "number") {
      return NextResponse.json(
        { error: "请提供有效的商品 ID" },
        { status: 400 }
      );
    }
    if (typeof quantity !== "number" || quantity < 1 || !Number.isInteger(quantity)) {
      return NextResponse.json(
        { error: "数量必须为正整数" },
        { status: 400 }
      );
    }

    // 检查商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, name: true },
    });

    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    if (product.stock < 1) {
      return NextResponse.json(
        { error: `${product.name} 库存不足` },
        { status: 400 }
      );
    }

    // 查找是否已在购物车中
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.userId,
          productId: productId,
        },
      },
    });

    const newQuantity = existing ? existing.quantity + quantity : quantity;

    // 检查库存
    if (newQuantity > product.stock) {
      return NextResponse.json(
        {
          error: `${product.name} 库存不足，当前库存 ${product.stock}，购物车中已有 ${existing?.quantity || 0} 件`,
        },
        { status: 400 }
      );
    }

    // 更新或创建购物车项
    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.userId,
          productId: productId,
        },
      },
      update: { quantity: newQuantity },
      create: {
        userId: session.userId,
        productId: productId,
        quantity: quantity,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            imageUrl: true,
            stock: true,
          },
        },
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("加入购物车失败:", error);
    return NextResponse.json(
      { error: "加入购物车失败，请稍后重试" },
      { status: 500 }
    );
  }
}
