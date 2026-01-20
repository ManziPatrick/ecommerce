import { PrismaClient, ROLE } from "@prisma/client";
import { buildDateFilter } from ".";

export const fetchData = async <T>(
  prisma: PrismaClient,
  model: keyof PrismaClient,
  dateField: string,
  startDate?: Date,
  endDate?: Date,
  yearStart?: Date,
  yearEnd?: Date,
  role?: ROLE,
  include?: Record<string, any>,
  shopId?: string
): Promise<T[]> => {
  const where: any = {
    [dateField]: buildDateFilter(startDate, endDate, yearStart, yearEnd),
  };
  if (role) where.role = role;

  if (shopId) {
    if (model === "order") {
      where.orderItems = { some: { shopId } };
    } else if (model === "user") {
      where.orders = { some: { orderItems: { some: { shopId } } } };
    } else if (model === "orderItem" || model === "product") {
      where.shopId = shopId;
    } else if (model === "interaction") {
      where.product = { shopId };
    }
  }

  return (prisma[model] as any).findMany({ where, include }) as Promise<T[]>;
};
