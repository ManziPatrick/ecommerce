import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import AppError from "@/shared/errors/AppError";
import { OrderService } from "./order.service";

export class OrderController {
  constructor(private orderService: OrderService) { }

  getAllOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }
    const orders = await this.orderService.getAllOrders(userId, userRole);
    sendResponse(res, 200, {
      data: { orders },
      message: "Orders retrieved successfully",
    });
  });

  getUserOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(400, "User not found");
    }
    const orders = await this.orderService.getUserOrders(userId);
    sendResponse(res, 200, {
      data: { orders },
      message: "Orders retrieved successfully",
    });
  });

  getOrderDetails = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) {
      throw new AppError(400, "User not found");
    }
    const order = await this.orderService.getOrderDetails(orderId, userId, userRole);
    sendResponse(res, 200, {
      data: { order },
      message: "Order details retrieved successfully",
    });
  });

  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { cartId } = req.body;
    if (!userId) {
      throw new AppError(400, "User not found");
    }
    if (!cartId) {
      throw new AppError(400, "Cart ID is required");
    }
    const order = await this.orderService.createOrderFromCart(userId, cartId);
    sendResponse(res, 201, {
      data: { order },
      message: "Order created successfully",
    });
  });

  updateOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }
    if (!status) {
      throw new AppError(400, "Status is required");
    }
    const order = await this.orderService.updateOrderStatus(orderId, status, userId, userRole);
    sendResponse(res, 200, {
      data: { order },
      message: "Order updated successfully",
    });
  });

  requestReturn = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }
    if (!reason) {
      throw new AppError(400, "Reason is required");
    }

    const returnRequest = await this.orderService.requestReturn(orderId, userId, reason);

    sendResponse(res, 201, {
      data: { returnRequest },
      message: "Return request submitted successfully",
    });
  });
}