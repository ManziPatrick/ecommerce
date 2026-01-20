import AppError from "@/shared/errors/AppError";
import { VendorRequestRepository } from "./vendorRequest.repository";
import { ShopRepository } from "../shop/shop.repository";
import slugify from "@/shared/utils/slugify";
import prisma from "@/infra/database/database.config";
import ApiFeatures from "@/shared/utils/ApiFeatures";
import { VENDOR_REQUEST_STATUS } from "@prisma/client";

export class VendorRequestService {
    constructor(
        private vendorRequestRepository: VendorRequestRepository,
        private shopRepository: ShopRepository
    ) { }

    async submitRequest(userId: string, data: {
        shopName: string;
        shopDescription: string;
        shopEmail?: string;
        phone?: string;
        country?: string;
        city?: string;
        village?: string;
        street?: string;
        placeName?: string;
        latitude?: number;
        longitude?: number;
    }) {
        // Check if user already has a pending request
        const existingRequest = await this.vendorRequestRepository.findRequestByUserId(userId);
        if (existingRequest) {
            throw new AppError(400, "You already have a pending vendor request");
        }

        // Check if user is already a vendor
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.role === "VENDOR") {
            throw new AppError(400, "You are already a vendor");
        }

        return this.vendorRequestRepository.createVendorRequest({
            userId,
            ...data
        });
    }

    async getAllRequests(queryString: Record<string, any>) {
        const apiFeatures = new ApiFeatures(queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            .build();

        const { where, orderBy, skip, take } = apiFeatures;

        const requests = await this.vendorRequestRepository.findVendorRequests({
            where,
            orderBy,
            skip,
            take,
        });

        const totalResults = await this.vendorRequestRepository.countVendorRequests(where);
        const totalPages = Math.ceil(totalResults / take);

        return {
            requests,
            totalResults,
            totalPages,
            currentPage: Math.floor(skip / take) + 1,
        };
    }

    async updateRequestStatus(
        requestId: string,
        status: VENDOR_REQUEST_STATUS,
        adminNotes?: string
    ) {
        const request = await this.vendorRequestRepository.findVendorRequestById(requestId);
        if (!request) {
            throw new AppError(404, "Vendor request not found");
        }

        if (request.status !== VENDOR_REQUEST_STATUS.PENDING) {
            throw new AppError(400, "Request has already been processed");
        }

        const updatedRequest = await this.vendorRequestRepository.updateVendorRequest(requestId, {
            status,
            adminNotes,
        });

        if (status === VENDOR_REQUEST_STATUS.APPROVED) {
            // 1. Upgrade user role
            await prisma.user.update({
                where: { id: request.userId },
                data: { role: "VENDOR" },
            });

            // 2. Create shop
            const slug = slugify(request.shopName);
            // Ensure slug is unique
            const existingShop = await this.shopRepository.findShopBySlug(slug);
            let finalSlug = slug;
            if (existingShop) {
                finalSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;
            }

            await this.shopRepository.createShop({
                name: request.shopName,
                slug: finalSlug,
                description: request.shopDescription,
                email: request.shopEmail || undefined,
                phone: request.phone || undefined,
                country: request.country || undefined,
                city: request.city || undefined,
                village: request.village || undefined,
                street: request.street || undefined,
                placeName: request.placeName || undefined,
                latitude: request.latitude || undefined,
                longitude: request.longitude || undefined,
                ownerId: request.userId,
            });
        }

        return updatedRequest;
    }
}
