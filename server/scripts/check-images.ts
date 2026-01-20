import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkImages() {
    const products = await prisma.product.findMany({
        take: 5,
        include: {
            variants: {
                take: 1
            }
        }
    });

    console.log("Product Images:");
    products.forEach(p => {
        console.log(`- ${p.name}:`);
        p.variants.forEach(v => {
            console.log(`  - Variant Images: ${JSON.stringify(v.images)}`);
        });
    });

    const categories = await prisma.category.findMany({
        take: 5
    });
    console.log("\nCategory Images:");
    categories.forEach(c => {
        console.log(`- ${c.name}: ${JSON.stringify(c.images)}`);
    });

    const users = await prisma.user.findMany({
        take: 5
    });
    console.log("\nUser Avatars:");
    users.forEach(u => {
        console.log(`- ${u.name}: ${u.avatar}`);
    });

    await prisma.$disconnect();
}

checkImages();
