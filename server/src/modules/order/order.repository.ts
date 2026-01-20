import prisma from "@/infra/database/database.config";

export class OrderRepository {
  async findAllOrders(shopId?: string) {
    return prisma.order.findMany({
      where: shopId ? { orderItems: { some: { shopId } } } : undefined,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          where: shopId ? { shopId } : undefined,
          include: { variant: { include: { product: true } } }
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOrdersByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { orderDate: "desc" },
      include: { orderItems: { include: { variant: { include: { product: true } } } } },
    });
  }

  async findOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { variant: { include: { product: true } } } },
        payment: true,
        address: true,
        shipment: true,
        transaction: true,
      },
    });
  }

  async createOrder(data: {
    userId: string;
    amount: number;
    orderItems: { variantId: string; quantity: number; price: number; shopId?: string }[];
    cartId: string;
    discountId?: string;
    discountAmount?: number;
  }) {
    return prisma.$transaction(async (tx) => {
      // Fetch all variants in one go and validate stock
      const variantIds = data.orderItems.map(item => item.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: {
          id: true,
          stock: true,
          productId: true,
          product: { select: { id: true, salesCount: true } }
        },
      });

      // Create a map for quick lookup
      const variantMap = new Map(variants.map(v => [v.id, v]));

      // Validate all items
      for (const item of data.orderItems) {
        const variant = variantMap.get(item.variantId);
        if (!variant) {
          throw new Error(`Variant not found: ${item.variantId}`);
        }
        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for variant ${item.variantId}: only ${variant.stock} available`);
        }
      }

      // Create order
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          discountId: data.discountId,
          discountAmount: data.discountAmount || 0,
          orderItems: {
            create: data.orderItems.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              shopId: item.shopId,
            })),
          },
          transaction: {
            create: {
              status: "PENDING",
            },
          },
        },
      });

      // Update stock and sales count
      for (const item of data.orderItems) {
        const variant = variantMap.get(item.variantId)!;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.product.update({
          where: { id: variant.product.id },
          data: { salesCount: { increment: item.quantity } },
        });
      }

      // If discount used
      if (data.discountId) {
        await tx.discount.update({
          where: { id: data.discountId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Delete cart
      await tx.cart.delete({
        where: { id: data.cartId },
      });

      return order;
    }, {
      maxWait: 15000,
      timeout: 15000,
    });
  }
}