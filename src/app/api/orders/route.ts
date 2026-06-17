import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * POST /api/orders — 从购物车创建订单
 * 将购物车中所有商品转为订单，清空购物车
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 获取用户的购物车项（含商品信息）
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          select: { id: true, name: true, price: true, stock: true },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "购物车为空" }, { status: 400 });
    }

    // 检查库存
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        return NextResponse.json(
          {
            error: `${item.product.name} 库存不足（当前库存 ${item.product.stock}，需要 ${item.quantity}）`,
          },
          { status: 400 }
        );
      }
    }

    // 计算总价
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // 使用事务：创建订单 + 扣减库存 + 清空购物车
    const order = await prisma.$transaction(async (tx) => {
      // 创建订单
      const newOrder = await tx.order.create({
        data: {
          userId: session.userId,
          status: "pending",
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, imageUrl: true },
              },
            },
          },
        },
      });

      // 扣减库存
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        // 检查库存是否变成负数（并发安全）
        const updated = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });

        if (updated && updated.stock < 0) {
          throw new Error(`${item.product.name} 库存不足`);
        }
      }

      // 清空购物车
      await tx.cartItem.deleteMany({
        where: { userId: session.userId },
      });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("创建订单失败:", error);
    const message =
      error instanceof Error ? error.message : "创建订单失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
