import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { DiscountService } from "./discount.service";

export class DiscountController {
    constructor(private discountService: DiscountService) { }

    createDiscount = asyncHandler(async (req: Request, res: Response) => {
        const discount = await this.discountService.createDiscount(req.body);
        sendResponse(res, 201, {
            data: { discount },
            message: "Discount created successfully",
        });
    });

    getAllDiscounts = asyncHandler(async (req: Request, res: Response) => {
        const discounts = await this.discountService.getAllDiscounts();
        sendResponse(res, 200, {
            data: { discounts },
            message: "Discounts retrieved successfully",
        });
    });

    validateDiscount = asyncHandler(async (req: Request, res: Response) => {
        const { code, amount } = req.body;
        const discount = await this.discountService.validateDiscount(code, amount);
        sendResponse(res, 200, {
            data: { discount },
            message: "Discount is valid",
        });
    });

    updateDiscount = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const discount = await this.discountService.updateDiscount(id, req.body);
        sendResponse(res, 200, {
            data: { discount },
            message: "Discount updated successfully",
        });
    });

    deleteDiscount = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await this.discountService.deleteDiscount(id);
        sendResponse(res, 204, {
            message: "Discount deleted successfully",
        });
    });
}
