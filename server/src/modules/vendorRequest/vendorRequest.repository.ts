import prisma from "@/infra/database/database.config";
import { Prisma, VENDOR_REQUEST_STATUS } from "@prisma/client";

export class VendorRequestRepository {
    async createVendorRequest(data: {
        userId: string;
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
        return prisma.vendorRequest.create({
            data,
        });
    }

    async findVendorRequests(params: {
        where?: Prisma.VendorRequestWhereInput;
        orderBy?: Prisma.VendorRequestOrderByWithRelationInput;
        skip?: number;
        take?: number;
    }) {
        const { where = {}, orderBy = { createdAt: "desc" }, skip = 0, take = 10 } = params;
        return prisma.vendorRequest.findMany({
            where,
            orderBy,
            skip,
            take,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findVendorRequestById(id: string) {
        return prisma.vendorRequest.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
    }

    async updateVendorRequest(id: string, data: Prisma.VendorRequestUpdateInput) {
        return prisma.vendorRequest.update({
            where: { id },
            data,
        });
    }

    async findRequestByUserId(userId: string) {
        return prisma.vendorRequest.findFirst({
            where: { userId, status: VENDOR_REQUEST_STATUS.PENDING },
        });
    }

    async countVendorRequests(where: Prisma.VendorRequestWhereInput = {}) {
        return prisma.vendorRequest.count({ where });
    }
}
