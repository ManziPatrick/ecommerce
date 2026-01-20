"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Neon Database connected successfully.");
    }
    catch (error) {
        console.log(error);
    }
};
exports.connectDB = connectDB;
exports.default = prisma;
