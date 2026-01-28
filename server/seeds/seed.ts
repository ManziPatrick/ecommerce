import { PrismaClient, ROLE } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient() as any;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCache = new Map<string, string>();

async function getCloudinaryUrl(url: string, folder: string = "general") {
  if (uploadCache.has(url)) return uploadCache.get(url)!;

  try {
    console.log(`☁️ Uploading to Cloudinary: ${url}`);
    const result = await cloudinary.uploader.upload(url, {
      folder: `seed/${folder}`,
      resource_type: "image",
    });
    uploadCache.set(url, result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.warn(`⚠️ Failed to upload ${url}, using placeholder instead`);
    // Return a placeholder image instead of the broken URL
    const placeholderUrl = "https://via.placeholder.com/800x600/6366f1/ffffff?text=Product+Image";
    uploadCache.set(url, placeholderUrl);
    return placeholderUrl;
  }
}

async function cleanup() {
  console.log("🧹 Cleaning up existing data...");

  // Delete in reverse order of dependencies to respect foreign key constraints
  await prisma.chatMessage.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.report.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.cartEvent.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.address.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.restock.deleteMany();
  await prisma.restock.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productVariantAttribute.deleteMany();
  await prisma.attributeValue.deleteMany();
  await prisma.categoryAttribute.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleanup completed");
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean up existing data first
  await cleanup();

  // 1. Create users
  const hashedPassword = await bcrypt.hash("password123", 12);

  const superadmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      password: hashedPassword,
      name: "Super Admin",
      role: "SUPERADMIN",
      avatar: await getCloudinaryUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80"),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
      avatar: await getCloudinaryUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80"),
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: hashedPassword,
      name: "Regular User",
      role: "USER",
      avatar: await getCloudinaryUrl("https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&h=200&q=80"),
    },
  });

  const vendor = await prisma.user.upsert({
    where: { email: "vendor@example.com" },
    update: {},
    create: {
      email: "vendor@example.com",
      password: hashedPassword,
      name: "Vendor User",
      role: "VENDOR",
      avatar: await getCloudinaryUrl("https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&h=200&q=80"),
    },
  });

  // Additional Users
  await prisma.user.upsert({
    where: { email: "admin2@example.com" },
    update: {},
    create: {
      email: "admin2@example.com",
      password: hashedPassword,
      name: "Admin User 2",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      email: "user2@example.com",
      password: hashedPassword,
      name: "Regular User 2",
      role: "USER",
    },
  });

  await prisma.user.upsert({
    where: { email: "user3@example.com" },
    update: {},
    create: {
      email: "user3@example.com",
      password: hashedPassword,
      name: "Regular User 3",
      role: "USER",
    },
  });

  // 1.5 Create Shop for Vendor
  const techHavenShop = await prisma.shop.upsert({
    where: { slug: "tech-haven" },
    update: {},
    create: {
      name: "Tech Haven",
      slug: "tech-haven",
      description: "Your one-stop shop for everything tech.",
      ownerId: vendor.id,
      logo: await getCloudinaryUrl("https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=400&h=400&q=80"),
    },
  });

  // 2. Create categories
  const electronicsCategory = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and gadgets",
      images: [await getCloudinaryUrl("https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80")],
    },
  });

  const clothingCategory = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: {
      name: "Clothing",
      slug: "clothing",
      description: "Fashion and apparel",
      images: [await getCloudinaryUrl("https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80")],
    },
  });

  const footwearCategory = await prisma.category.upsert({
    where: { slug: "footwear" },
    update: {},
    create: {
      name: "Footwear",
      slug: "footwear",
      description: "Shoes and sneakers",
      images: [await getCloudinaryUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80")],
    },
  });

  const furnitureCategory = await prisma.category.upsert({
    where: { slug: "furniture" },
    update: {},
    create: {
      name: "Furniture",
      slug: "furniture",
      description: "Home and office furniture",
      images: [await getCloudinaryUrl("https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80")],
    },
  });

  const accessoriesCategory = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      name: "Accessories",
      slug: "accessories",
      description: "Fashion accessories and jewelry",
      images: [await getCloudinaryUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80")],
    },
  });

  // 3. Create attributes
  const sizeAttribute = await prisma.attribute.upsert({
    where: { slug: "size" },
    update: {},
    create: {
      name: "Size",
      slug: "size",
    },
  });

  const colorAttribute = await prisma.attribute.upsert({
    where: { slug: "color" },
    update: {},
    create: {
      name: "Color",
      slug: "color",
    },
  });

  const materialAttribute = await prisma.attribute.upsert({
    where: { slug: "material" },
    update: {},
    create: {
      name: "Material",
      slug: "material",
    },
  });

  const storageAttribute = await prisma.attribute.upsert({
    where: { slug: "storage" },
    update: {},
    create: {
      name: "Storage",
      slug: "storage",
    },
  });

  const brandAttribute = await prisma.attribute.upsert({
    where: { slug: "brand" },
    update: {},
    create: {
      name: "Brand",
      slug: "brand",
    },
  });

  // 4. Create attribute values
  // Size values
  const sizeXS = await prisma.attributeValue.upsert({
    where: { slug: "xs" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "XS",
      slug: "xs",
    },
  });

  const sizeS = await prisma.attributeValue.upsert({
    where: { slug: "s" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "S",
      slug: "s",
    },
  });

  const sizeM = await prisma.attributeValue.upsert({
    where: { slug: "m" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "M",
      slug: "m",
    },
  });

  const sizeL = await prisma.attributeValue.upsert({
    where: { slug: "l" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "L",
      slug: "l",
    },
  });

  const sizeXL = await prisma.attributeValue.upsert({
    where: { slug: "xl" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "XL",
      slug: "xl",
    },
  });

  const sizeXXL = await prisma.attributeValue.upsert({
    where: { slug: "xxl" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "XXL",
      slug: "xxl",
    },
  });

  // Color values
  const colorRed = await prisma.attributeValue.upsert({
    where: { slug: "red" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "Red",
      slug: "red",
    },
  });

  const colorBlue = await prisma.attributeValue.upsert({
    where: { slug: "blue" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "Blue",
      slug: "blue",
    },
  });

  const colorBlack = await prisma.attributeValue.upsert({
    where: { slug: "black" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "Black",
      slug: "black",
    },
  });

  const colorWhite = await prisma.attributeValue.upsert({
    where: { slug: "white" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "White",
      slug: "white",
    },
  });

  const colorGreen = await prisma.attributeValue.upsert({
    where: { slug: "green" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "Green",
      slug: "green",
    },
  });

  const colorYellow = await prisma.attributeValue.upsert({
    where: { slug: "yellow" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "Yellow",
      slug: "yellow",
    },
  });

  // Material values
  const materialCotton = await prisma.attributeValue.upsert({
    where: { slug: "cotton" },
    update: {},
    create: {
      attributeId: materialAttribute.id,
      value: "Cotton",
      slug: "cotton",
    },
  });

  const materialLeather = await prisma.attributeValue.upsert({
    where: { slug: "leather" },
    update: {},
    create: {
      attributeId: materialAttribute.id,
      value: "Leather",
      slug: "leather",
    },
  });

  const materialPolyester = await prisma.attributeValue.upsert({
    where: { slug: "polyester" },
    update: {},
    create: {
      attributeId: materialAttribute.id,
      value: "Polyester",
      slug: "polyester",
    },
  });

  const materialWood = await prisma.attributeValue.upsert({
    where: { slug: "wood" },
    update: {},
    create: {
      attributeId: materialAttribute.id,
      value: "Wood",
      slug: "wood",
    },
  });

  const materialMetal = await prisma.attributeValue.upsert({
    where: { slug: "metal" },
    update: {},
    create: {
      attributeId: materialAttribute.id,
      value: "Metal",
      slug: "metal",
    },
  });

  // Storage values
  const storage128GB = await prisma.attributeValue.upsert({
    where: { slug: "128gb" },
    update: {},
    create: {
      attributeId: storageAttribute.id,
      value: "128GB",
      slug: "128gb",
    },
  });

  const storage256GB = await prisma.attributeValue.upsert({
    where: { slug: "256gb" },
    update: {},
    create: {
      attributeId: storageAttribute.id,
      value: "256GB",
      slug: "256gb",
    },
  });

  const storage512GB = await prisma.attributeValue.upsert({
    where: { slug: "512gb" },
    update: {},
    create: {
      attributeId: storageAttribute.id,
      value: "512GB",
      slug: "512gb",
    },
  });

  const storage1TB = await prisma.attributeValue.upsert({
    where: { slug: "1tb" },
    update: {},
    create: {
      attributeId: storageAttribute.id,
      value: "1TB",
      slug: "1tb",
    },
  });

  // Brand values
  const brandApple = await prisma.attributeValue.upsert({
    where: { slug: "apple" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "Apple",
      slug: "apple",
    },
  });

  const brandNike = await prisma.attributeValue.upsert({
    where: { slug: "nike" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "Nike",
      slug: "nike",
    },
  });

  const brandAdidas = await prisma.attributeValue.upsert({
    where: { slug: "adidas" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "Adidas",
      slug: "adidas",
    },
  });

  const brandSamsung = await prisma.attributeValue.upsert({
    where: { slug: "samsung" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "Samsung",
      slug: "samsung",
    },
  });

  const brandIkea = await prisma.attributeValue.upsert({
    where: { slug: "ikea" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "IKEA",
      slug: "ikea",
    },
  });

  // 5. Assign attributes to categories
  // Clothing attributes
  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: clothingCategory.id,
        attributeId: sizeAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: clothingCategory.id,
      attributeId: sizeAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: clothingCategory.id,
        attributeId: colorAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: clothingCategory.id,
      attributeId: colorAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: clothingCategory.id,
        attributeId: materialAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: clothingCategory.id,
      attributeId: materialAttribute.id,
      isRequired: false,
    },
  });

  // Footwear attributes
  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: footwearCategory.id,
        attributeId: sizeAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: footwearCategory.id,
      attributeId: sizeAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: footwearCategory.id,
        attributeId: colorAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: footwearCategory.id,
      attributeId: colorAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: footwearCategory.id,
        attributeId: materialAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: footwearCategory.id,
      attributeId: materialAttribute.id,
      isRequired: false,
    },
  });

  // Electronics attributes
  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: electronicsCategory.id,
        attributeId: colorAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: electronicsCategory.id,
      attributeId: colorAttribute.id,
      isRequired: false,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: electronicsCategory.id,
        attributeId: storageAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: electronicsCategory.id,
      attributeId: storageAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: electronicsCategory.id,
        attributeId: brandAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: electronicsCategory.id,
      attributeId: brandAttribute.id,
      isRequired: false,
    },
  });

  // Furniture attributes
  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: furnitureCategory.id,
        attributeId: materialAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: furnitureCategory.id,
      attributeId: materialAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: furnitureCategory.id,
        attributeId: colorAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: furnitureCategory.id,
      attributeId: colorAttribute.id,
      isRequired: false,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: furnitureCategory.id,
        attributeId: brandAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: furnitureCategory.id,
      attributeId: brandAttribute.id,
      isRequired: false,
    },
  });

  // 6. Create ~25 products with variants
  const products = [
    // Electronics
    {
      name: "iPhone 16 Pro",
      slug: "iphone-16-pro",
      description: "Latest iPhone with advanced features, powerful A18 chip, and pro-grade camera system.",
      categoryId: electronicsCategory.id,
      isNew: true,
      isFeatured: true,
      variants: [
        {
          sku: "IPH16-PRO-128-BLACK",
          price: 999.99,
          stock: 25,
          barcode: "1234567890001",
          warehouseLocation: "WH-1A",
          attributes: [
            { attributeId: storageAttribute.id, valueId: storage128GB.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: brandAttribute.id, valueId: brandApple.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1556656793-062ff9871500?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      description: "Industry-leading noise-canceling headphones with exceptional sound quality.",
      categoryId: electronicsCategory.id,
      isNew: true,
      isFeatured: true,
      variants: [
        {
          sku: "SNY-XM5-BLK",
          price: 349.99,
          stock: 40,
          barcode: "SNY001",
          warehouseLocation: "WH-1B",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "MacBook Pro M3",
      slug: "macbook-pro-m3",
      description: "The most advanced Mac laptop ever created with the revolutionary M3 chip.",
      categoryId: electronicsCategory.id,
      isNew: true,
      isFeatured: true,
      variants: [
        {
          sku: "MBP-M3-512-SGR",
          price: 1599.99,
          stock: 15,
          barcode: "MBP001",
          warehouseLocation: "WH-1C",
          attributes: [
            { attributeId: storageAttribute.id, valueId: storage512GB.id },
            { attributeId: brandAttribute.id, valueId: brandApple.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1611186871348-b1fd6920f20a?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description: "Ultimate Galaxy experience with integrated S Pen and AI-powered pro-camera.",
      categoryId: electronicsCategory.id,
      isBestSeller: true,
      variants: [
        {
          sku: "SAM-S24U-256-GRY",
          price: 1199.99,
          stock: 30,
          barcode: "SAM001",
          warehouseLocation: "WH-1D",
          attributes: [
            { attributeId: storageAttribute.id, valueId: storage256GB.id },
            { attributeId: brandAttribute.id, valueId: brandSamsung.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1583573636246-18cb2246697f?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "PlayStation 5",
      slug: "playstation-5",
      description: "Experience lightning-fast loading and deeper immersion with the PS5.",
      categoryId: electronicsCategory.id,
      isTrending: true,
      variants: [
        {
          sku: "PS5-DISC-WHT",
          price: 499.99,
          stock: 20,
          barcode: "PS5001",
          warehouseLocation: "WH-1E",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorWhite.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1606813907291-d86ebb9c94ad?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },

    // Clothing
    {
      name: "Premium Cotton Hoodie",
      slug: "premium-cotton-hoodie",
      description: "Soft, durable, and stylish hoodie made from 100% premium cotton.",
      categoryId: clothingCategory.id,
      isNew: true,
      isTrending: true,
      variants: [
        {
          sku: "HOD-COT-BLK-M",
          price: 59.99,
          stock: 50,
          barcode: "HOD001",
          warehouseLocation: "WH-2A",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeM.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1578939662863-5cd416d45a69?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1513373319109-eb154073eb0b?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Vintage Summer Dress",
      slug: "vintage-summer-dress",
      description: "Lightweight and flowy dress perfect for warm summer days.",
      categoryId: clothingCategory.id,
      isTrending: true,
      variants: [
        {
          sku: "DRS-SUM-YEL-S",
          price: 45.99,
          stock: 35,
          barcode: "DRS001",
          warehouseLocation: "WH-2B",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeS.id },
            { attributeId: colorAttribute.id, valueId: colorYellow.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Cargo Utility Pants",
      slug: "cargo-utility-pants",
      description: "Durable pants with multiple pockets for maximum utility.",
      categoryId: clothingCategory.id,
      isBestSeller: true,
      variants: [
        {
          sku: "PNT-CAR-GRN-L",
          price: 69.99,
          stock: 40,
          barcode: "PNT001",
          warehouseLocation: "WH-2C",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeL.id },
            { attributeId: colorAttribute.id, valueId: colorGreen.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1624373415555-97309e40375e?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1473966968600-fa804b868622?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Winter Parka",
      slug: "winter-parka",
      description: "Extra-warm insulated parka for extreme winter conditions.",
      categoryId: clothingCategory.id,
      isFeatured: true,
      variants: [
        {
          sku: "JKT-PAR-BLU-XL",
          price: 189.99,
          stock: 15,
          barcode: "JKT001",
          warehouseLocation: "WH-2D",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeXL.id },
            { attributeId: colorAttribute.id, valueId: colorBlue.id },
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1544923246-77307dd654ca?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1444491741275-3747c03c99b2?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Silk Evening Scarf",
      slug: "silk-evening-scarf",
      description: "Elegant silk scarf that adds a touch of luxury to any outfit.",
      categoryId: clothingCategory.id,
      isNew: true,
      variants: [
        {
          sku: "SCF-SLK-RED-ON",
          price: 35.00,
          stock: 60,
          barcode: "SCF001",
          warehouseLocation: "WH-2E",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorRed.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1601052988582-7d2d60bc37ac?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1601052988457-3f3366085a85?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },

    // Footwear
    {
      name: "Classic Canvas Sneakers",
      slug: "classic-canvas-sneakers",
      description: "Timeless canvas sneakers that go with everything.",
      categoryId: footwearCategory.id,
      isBestSeller: true,
      variants: [
        {
          sku: "SNK-CAN-WHT-42",
          price: 49.99,
          stock: 100,
          barcode: "SNK001",
          warehouseLocation: "WH-3A",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeL.id },
            { attributeId: colorAttribute.id, valueId: colorWhite.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Rugged Leather Boots",
      slug: "rugged-leather-boots",
      description: "Durable leather boots designed for the outdoors.",
      categoryId: footwearCategory.id,
      isFeatured: true,
      variants: [
        {
          sku: "BT-LTH-BRN-44",
          price: 159.99,
          stock: 25,
          barcode: "BT001",
          warehouseLocation: "WH-3B",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeXL.id },
            { attributeId: materialAttribute.id, valueId: materialLeather.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1520639889313-7272260b8849?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1541597473841-a966732d744b?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Performance Running Shoes",
      slug: "performance-running-shoes",
      description: "Lightweight and responsive shoes for serious runners.",
      categoryId: footwearCategory.id,
      isTrending: true,
      variants: [
        {
          sku: "RUN-PRF-BLU-43",
          price: 129.99,
          discountPrice: 99.99,
          stock: 45,
          barcode: "RUN001",
          warehouseLocation: "WH-3C",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeL.id },
            { attributeId: colorAttribute.id, valueId: colorBlue.id },
            { attributeId: brandAttribute.id, valueId: brandNike.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "High-Top Sneakers",
      slug: "high-top-sneakers",
      description: "Stylish high-top sneakers with a modern edge.",
      categoryId: footwearCategory.id,
      isNew: true,
      variants: [
        {
          sku: "SNK-HI-RED-41",
          price: 79.99,
          stock: 30,
          barcode: "SNK002",
          warehouseLocation: "WH-3D",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeM.id },
            { attributeId: colorAttribute.id, valueId: colorRed.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Professional Hiking Boots",
      slug: "pro-hiking-boots",
      description: "Technical hiking boots built for tough terrains and long distances.",
      categoryId: footwearCategory.id,
      isFeatured: true,
      variants: [
        {
          sku: "BT-HK-GRY-45",
          price: 199.99,
          stock: 12,
          barcode: "BT002",
          warehouseLocation: "WH-3E",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeXXL.id },
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },

    // Furniture
    {
      name: "Modern Velvet Sofa",
      slug: "modern-velvet-sofa",
      description: "Luxurious velvet sofa that combines comfort with chic modern design.",
      categoryId: furnitureCategory.id,
      isFeatured: true,
      variants: [
        {
          sku: "SOF-MOD-BLU-1",
          price: 899.00,
          stock: 5,
          barcode: "SOF001",
          warehouseLocation: "WH-4A",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
            { attributeId: colorAttribute.id, valueId: colorBlue.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Minimalist Floor Lamp",
      slug: "minimalist-floor-lamp",
      description: "Sleek and minimalist floor lamp providing warm ambient light.",
      categoryId: furnitureCategory.id,
      isNew: true,
      variants: [
        {
          sku: "LMP-MIN-BLK-1",
          price: 120.00,
          stock: 20,
          barcode: "LMP001",
          warehouseLocation: "WH-4B",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialMetal.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Oak Bookshelf",
      slug: "oak-bookshelf",
      description: "Sturdy and spacious bookshelf made from solid oak wood.",
      categoryId: furnitureCategory.id,
      isBestSeller: true,
      variants: [
        {
          sku: "BSH-OAK-BRN-1",
          price: 349.99,
          stock: 10,
          barcode: "BSH001",
          warehouseLocation: "WH-4C",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialWood.id },
            { attributeId: brandAttribute.id, valueId: brandIkea.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1544413647-ad51989e3a72?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1512918766671-ad651963503a?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Marble Coffee Table",
      slug: "marble-coffee-table",
      description: "Sophisticated coffee table with a premium marble top.",
      categoryId: furnitureCategory.id,
      isTrending: true,
      variants: [
        {
          sku: "TBL-COF-WHT-1",
          price: 275.00,
          stock: 8,
          barcode: "TBL001",
          warehouseLocation: "WH-4D",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialWood.id },
            { attributeId: colorAttribute.id, valueId: colorWhite.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1572891212674-42aa3cb30ef9?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Ergonomic Office Chair",
      slug: "ergonomic-office-chair",
      description: "Full-support office chair designed for long work hours.",
      categoryId: furnitureCategory.id,
      isBestSeller: true,
      variants: [
        {
          sku: "CHR-ERG-BLK-1",
          price: 450.00,
          stock: 15,
          barcode: "CHR002",
          warehouseLocation: "WH-4E",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1505797149023-ebcb233dfded?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1416339134316-0e81ac9d9217?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },

    // Accessories
    {
      name: "Rugged Adventure Backpack",
      slug: "rugged-adventure-backpack",
      description: "Water-resistant backpack with multiple compartments for all your adventures.",
      categoryId: accessoriesCategory.id,
      isTrending: true,
      variants: [
        {
          sku: "BPK-ADV-GRN-1",
          price: 110.00,
          stock: 30,
          barcode: "BPK001",
          warehouseLocation: "WH-5A",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorGreen.id },
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1519183071298-a2962fed14f4?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1581605405669-fec81016629b?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Luxury Titanium Watch",
      slug: "luxury-titanium-watch",
      description: "Exquisite titanium watch with precision movement and sapphire glass.",
      categoryId: accessoriesCategory.id,
      isFeatured: true,
      variants: [
        {
          sku: "WCH-LUX-SLV-1",
          price: 2499.00,
          stock: 5,
          barcode: "WCH001",
          warehouseLocation: "WH-5B",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialMetal.id },
            { attributeId: colorAttribute.id, valueId: colorWhite.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Handcrafted Leather Belt",
      slug: "handcrafted-leather-belt",
      description: "Full-grain leather belt handcrafted to last a lifetime.",
      categoryId: accessoriesCategory.id,
      isBestSeller: true,
      variants: [
        {
          sku: "BLT-LTH-BRN-1",
          price: 55.00,
          stock: 50,
          barcode: "BLT001",
          warehouseLocation: "WH-5C",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialLeather.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1624222247344-550fb805bb31?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1553018260-062bb243a758?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1490100667990-4fced8021649?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "UV Protection Sunglasses",
      slug: "uv-protection-sunglasses",
      description: "Polarized sunglasses with 100% UV protection and classic style.",
      categoryId: accessoriesCategory.id,
      isTrending: true,
      variants: [
        {
          sku: "SGL-UV-BLK-1",
          price: 135.00,
          stock: 25,
          barcode: "SGL001",
          warehouseLocation: "WH-5D",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: materialAttribute.id, valueId: materialMetal.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Linen Baseball Cap",
      slug: "linen-baseball-cap",
      description: "Breathable linen baseball cap, perfect for a casual summer look.",
      categoryId: accessoriesCategory.id,
      isNew: true,
      variants: [
        {
          sku: "CAP-LIN-WHT-1",
          price: 29.99,
          stock: 40,
          barcode: "CAP001",
          warehouseLocation: "WH-5E",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
            { attributeId: colorAttribute.id, valueId: colorWhite.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1596455607563-ad619bfc4a60?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Nintendo Switch OLED",
      slug: "nintendo-switch-oled",
      description: "Play at home on the TV or on-the-go with a vibrant 7-inch OLED screen.",
      categoryId: electronicsCategory.id,
      isFeatured: true,
      variants: [
        {
          sku: "NSW-OLED-WHT",
          price: 349.99,
          stock: 30,
          barcode: "NSW001",
          warehouseLocation: "WH-1F",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorWhite.id },
            { attributeId: storageAttribute.id, valueId: storage128GB.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1595166611225-c18cff835a63?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1585144152161-c45203586cd5?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Kindle Paperwhite",
      slug: "kindle-paperwhite",
      description: "Now with a 6.8-inch display and thinner borders, adjustable warm light, and up to 10 weeks of battery life.",
      categoryId: electronicsCategory.id,
      isBestSeller: true,
      variants: [
        {
          sku: "KND-PW-16-BLK",
          price: 139.99,
          stock: 50,
          barcode: "KND001",
          warehouseLocation: "WH-1G",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: storageAttribute.id, valueId: storage128GB.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1592492152545-9695d3f473f4?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Linen Relaxed Shirt",
      slug: "linen-relaxed-shirt",
      description: "Breathable and comfortable linen shirt for a casual summer look.",
      categoryId: clothingCategory.id,
      isNew: true,
      variants: [
        {
          sku: "SHR-LIN-WHT-L",
          price: 45.00,
          stock: 40,
          barcode: "SHR001",
          warehouseLocation: "WH-2F",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeL.id },
            { attributeId: colorAttribute.id, valueId: colorWhite.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1598033129183-c4f50c717658?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1594932224010-74f43c16ac10?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1594932224010-74f43c16ac10?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Knitted Beanie Hat",
      slug: "knitted-beanie-hat",
      description: "Cozy and warm beanie hat, perfect for cold weather.",
      categoryId: clothingCategory.id,
      isTrending: true,
      variants: [
        {
          sku: "HAT-BN-YEL-ON",
          price: 19.99,
          stock: 100,
          barcode: "HAT001",
          warehouseLocation: "WH-2G",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorYellow.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1621245781309-4ce49911925b?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1605336100517-e836ee7bf26f?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Formal Oxford Shoes",
      slug: "formal-oxford-shoes",
      description: "Classic leather Oxford shoes for professional and formal occasions.",
      categoryId: footwearCategory.id,
      isFeatured: true,
      variants: [
        {
          sku: "SH-OX-BLK-42",
          price: 125.00,
          stock: 20,
          barcode: "SH001",
          warehouseLocation: "WH-3F",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeL.id },
            { attributeId: materialAttribute.id, valueId: materialLeather.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1533867617858-e7ceaf5800d3?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1614252329302-3112423985ea?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Minimalist Bedside Table",
      slug: "minimalist-bedside-table",
      description: "Simple and elegant bedside table with a single drawer.",
      categoryId: furnitureCategory.id,
      isNew: true,
      variants: [
        {
          sku: "TBL-BS-WHT-1",
          price: 85.00,
          stock: 30,
          barcode: "TBL002",
          warehouseLocation: "WH-4F",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialWood.id },
            { attributeId: colorAttribute.id, valueId: colorWhite.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1534349762230-e0cadf78f5db?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Round Oak Dining Table",
      slug: "round-oak-dining-table",
      description: "Solid oak dining table, perfect for small families and cozy meals.",
      categoryId: furnitureCategory.id,
      isFeatured: true,
      variants: [
        {
          sku: "TBL-DN-OAK-1",
          price: 550.00,
          stock: 10,
          barcode: "TBL003",
          warehouseLocation: "WH-4G",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialWood.id },
            { attributeId: brandAttribute.id, valueId: brandIkea.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1530018607912-eff2df114f11?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1595515106969-a0f857be820d?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Leather Messenger Bag",
      slug: "leather-messenger-bag",
      description: "Professional leather messenger bag with dedicated laptop compartment.",
      categoryId: accessoriesCategory.id,
      isBestSeller: true,
      variants: [
        {
          sku: "BAG-MSG-BRN-1",
          price: 145.00,
          stock: 25,
          barcode: "BAG001",
          warehouseLocation: "WH-5F",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialLeather.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1511405118151-54a70b2089ba?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1530177150700-84cd9a3b059b?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
    {
      name: "Insulated Sports Bottle",
      slug: "insulated-sports-bottle",
      description: "Keep your drinks cold for 24 hours or hot for 12 hours with this durable bottle.",
      categoryId: accessoriesCategory.id,
      isTrending: true,
      variants: [
        {
          sku: "BTL-SPS-BLU-1",
          price: 35.00,
          stock: 150,
          barcode: "BTL001",
          warehouseLocation: "WH-5G",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorBlue.id },
            { attributeId: materialAttribute.id, valueId: materialMetal.id },
          ],
          images: [
            await getCloudinaryUrl("https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1616712134411-6b6ae89bc3ba?auto=format&fit=crop&w=800&q=80"),
            await getCloudinaryUrl("https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=800&q=80"),
          ],
        },
      ],
    },
  ];

  // Create products and variants
  const createdProducts: any[] = [];
  const createdVariants: any[] = [];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        categoryId: productData.categoryId,
        isNew: productData.isNew,
        isFeatured: productData.isFeatured,
        isTrending: productData.isTrending,
        isBestSeller: productData.isBestSeller,
        shopId: productData.categoryId === electronicsCategory.id ? techHavenShop.id : undefined,
      },
    });

    createdProducts.push(product);

    for (const variantData of productData.variants as any[]) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variantData.sku,
          price: variantData.price,
          discountPrice: variantData.discountPrice,
          stock: variantData.stock,
          lowStockThreshold: 10,
          barcode: variantData.barcode,
          warehouseLocation: variantData.warehouseLocation,
          images: variantData.images || [],
        },
      });

      // Create variant attributes
      for (const attr of variantData.attributes) {
        await prisma.productVariantAttribute.create({
          data: {
            variantId: variant.id,
            attributeId: attr.attributeId,
            valueId: attr.valueId,
          },
        });
      }

      createdVariants.push(variant);
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Created:");
  console.log(`- Users: Superadmin, Admin, User`);
  console.log(
    `- Categories: ${electronicsCategory.name}, ${clothingCategory.name}, ${footwearCategory.name}, ${furnitureCategory.name}, ${accessoriesCategory.name}`
  );
  console.log(`- Attributes: Size, Color, Material, Storage, Brand`);
  console.log(`- Products: ${createdProducts.length} products with variants`);
  console.log(`- Variants: ${createdVariants.length} variants with attributes`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
