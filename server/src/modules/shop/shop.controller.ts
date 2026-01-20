import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { makeLogsService } from "../logs/logs.factory";
import { uploadToCloudinary } from "@/shared/utils/uploadToCloudinary";
import { ShopService } from "./shop.service";

export class ShopController {
    private logsService = makeLogsService();
    constructor(private shopService: ShopService) { }

    getAllShops = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const {
                shops,
                totalResults,
                totalPages,
                currentPage,
                resultsPerPage,
            } = await this.shopService.getAllShops(req.query);
            sendResponse(res, 200, {
                data: {
                    shops,
                    totalResults,
                    totalPages,
                    currentPage,
                    resultsPerPage,
                },
                message: "Shops fetched successfully",
            });
        }
    );

    getShop = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id: shopId } = req.params;
            const shop = await this.shopService.getShop(shopId);
            sendResponse(res, 200, {
                data: { shop },
                message: "Shop fetched successfully",
            });
        }
    );

    getMyShop = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error("User not authenticated");
            }
            const shop = await this.shopService.getShopByOwnerId(userId);
            sendResponse(res, 200, {
                data: { shop },
                message: "Shop fetched successfully",
            });
        }
    );

    getShopBySlug = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { slug } = req.params;
            const shop = await this.shopService.getShopBySlug(slug);
            sendResponse(res, 200, {
                data: { shop },
                message: "Shop fetched successfully",
            });
        }
    );

    createShop = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { name, description } = req.body;
            const ownerId = req.user?.id; // The person creating the shop is the owner

            if (!ownerId) {
                throw new Error("User not authenticated");
            }

            const files = req.files as Express.Multer.File[];
            let logoUrl: string | undefined;

            if (Array.isArray(files) && files.length > 0) {
                const uploadedImages = await uploadToCloudinary(files);
                logoUrl = uploadedImages[0]?.url;
            }

            const { shop } = await this.shopService.createShop({
                name,
                description,
                logo: logoUrl,
                ownerId,
            });

            sendResponse(res, 201, {
                data: { shop },
                message: "Shop created successfully",
            });

            this.logsService.info("Shop created", {
                userId: ownerId,
                shopId: shop.id,
            });
        }
    );

    updateShop = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id: shopId } = req.params;
            const { name, description } = req.body;

            const files = req.files as Express.Multer.File[];
            let logoUrl: string | undefined;

            if (Array.isArray(files) && files.length > 0) {
                const uploadedImages = await uploadToCloudinary(files);
                logoUrl = uploadedImages[0]?.url;
            }

            const { shop } = await this.shopService.updateShop(shopId, {
                name,
                description,
                logo: logoUrl,
            });

            sendResponse(res, 200, {
                data: { shop },
                message: "Shop updated successfully",
            });
        }
    );

    deleteShop = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id: shopId } = req.params;
            await this.shopService.deleteShop(shopId);
            sendResponse(res, 204, { message: "Shop deleted successfully" });
        }
    );
}
