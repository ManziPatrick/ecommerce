
import { PrismaClient } from "@prisma/client";
import userAnalytics from "../src/modules/analytics/graphql/resolvers/userAnalytics";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("🚀 Testing userAnalytics resolver...");

        const params = {
            timePeriod: "allTime",
            year: 2026,
        };

        const context = {
            prisma,
            req: {} as any,
            res: {} as any,
        };

        const result = await userAnalytics.Query.userAnalytics(
            {},
            { params },
            context
        );

        console.log("✅ Success:", result);
    } catch (error) {
        console.error("❌ Failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
