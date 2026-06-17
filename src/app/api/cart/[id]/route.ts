import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/**
 * PUT /api/cart/[id] — 修改购物车商品数量
 * Body: { quantity: number }
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "无效的购物车项 ID" }, { status: 400 });
    }

    const body = await request.json();
    const { quantity } = body;

    if (typeof quantity !== "number" || quantity < 0 || !Number.isInteger(quantity)) {
      return NextResponse.json(
        { error: "数量必须为非负整数" },
        { status: 400 }
      );
    }

    // 查找购物车项，确认属于当前用户
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: { select: { stock: true, name: true } } },
    });

    if (!cartItem || cartItem.userId !== session.userId) {
      return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
    }

    // 数量为 0 时直接删除
    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ success: true });
    }

    // 检查库存
    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        {
          error: `${cartItem.product.name} 库存不足，当前库存 ${cartItem.product.stock}`,
        },
        { status: 400 }
      );
    }

    // 更新数量
    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
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

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("更新购物车失败:", error);
    return NextResponse.json(
      { error: "更新购物车失败，请稍后重试" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/[id] — 删除购物车项
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "无效的购物车项 ID" }, { status: 400 });
    }

    // 查找购物车项，确认属于当前用户
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      select: { id: true, userId: true },
    });

    if (!cartItem || cartItem.userId !== session.userId) {
      return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除购物车项失败:", error);
    return NextResponse.json(
      { error: "删除购物车项失败，请稍后重试" },
      { status: 500 }
    );
  }
}
