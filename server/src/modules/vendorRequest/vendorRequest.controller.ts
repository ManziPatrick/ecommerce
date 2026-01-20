import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { VendorRequestService } from "./vendorRequest.service";
import { VENDOR_REQUEST_STATUS } from "@prisma/client";

export class VendorRequestController {
    constructor(private vendorRequestService: VendorRequestService) { }

    submitRequest = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const {
                shopName,
                shopDescription,
                shopEmail,
                phone,
                country,
                city,
                village,
                street,
                placeName,
                latitude,
                longitude,
            } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                throw new Error("User not authenticated");
            }

            const request = await this.vendorRequestService.submitRequest(userId, {
                shopName,
                shopDescription,
                shopEmail,
                phone,
                country,
                city,
                village,
                street,
                placeName,
                latitude,
                longitude,
            });

            sendResponse(res, 201, {
                data: { request },
                message: "Vendor request submitted successfully",
            });
        }
    );

    getAllRequests = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { requests, totalResults, totalPages, currentPage } =
                await this.vendorRequestService.getAllRequests(req.query);

            sendResponse(res, 200, {
                data: { requests, totalResults, totalPages, currentPage },
                message: "Vendor requests fetched successfully",
            });
        }
    );

    updateRequestStatus = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id } = req.params;
            const { status, adminNotes } = req.body;

            if (!Object.values(VENDOR_REQUEST_STATUS).includes(status)) {
                throw new Error("Invalid status");
            }

            const request = await this.vendorRequestService.updateRequestStatus(
                id,
                status as VENDOR_REQUEST_STATUS,
                adminNotes
            );

            sendResponse(res, 200, {
                data: { request },
                message: `Vendor request ${status.toLowerCase()} successfully`,
            });
        }
    );
}
