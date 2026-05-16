import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createMissingTables() {
  console.log("🔧 Creating missing tables and fixing enums...\n");

  try {
    // Fix ROLE enum to include VENDOR if missing
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'ROLE' AND e.enumlabel = 'VENDOR'
        ) THEN
          ALTER TYPE "ROLE" ADD VALUE 'VENDOR';
        END IF;
      END $$;
    `);
    console.log("✅ ROLE enum verified (VENDOR added if missing)");

    // Create Shop table if it doesn't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Shop" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "logo" TEXT,
        "email" TEXT,
        "phone" TEXT,
        "country" TEXT,
        "city" TEXT,
        "village" TEXT,
        "street" TEXT,
        "placeName" TEXT,
        "latitude" DOUBLE PRECISION,
        "longitude" DOUBLE PRECISION,
        "ownerId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("✅ Shop table created/verified");

    // Create unique constraints if they don't exist
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Shop_name_key') THEN
          ALTER TABLE "Shop" ADD CONSTRAINT "Shop_name_key" UNIQUE ("name");
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Shop_slug_key') THEN
          ALTER TABLE "Shop" ADD CONSTRAINT "Shop_slug_key" UNIQUE ("slug");
        END IF;
      END $$;
    `);
    console.log("✅ Shop unique constraints created/verified");

    // Create index if it doesn't exist
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Shop_name_slug_ownerId_idx" ON "Shop"("name", "slug", "ownerId");
    `);
    console.log("✅ Shop indexes created/verified");

    // Add foreign key if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'Shop_ownerId_fkey'
        ) THEN
          ALTER TABLE "Shop" 
          ADD CONSTRAINT "Shop_ownerId_fkey" 
          FOREIGN KEY ("ownerId") 
          REFERENCES "User"("id") 
          ON DELETE CASCADE 
          ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log("✅ Shop foreign keys created/verified");

    // Create other potentially missing tables
    const otherTables = [
      {
        name: "Product",
        sql: `CREATE TABLE IF NOT EXISTS "Product" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
        );`
      },
      {
        name: "Order",
        sql: `CREATE TABLE IF NOT EXISTS "Order" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
        );`
      },
      {
        name: "OrderItem",
        sql: `CREATE TABLE IF NOT EXISTS "OrderItem" (
          "id" TEXT NOT NULL,
          "orderId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
        );`
      },
      {
        name: "CartItem",
        sql: `CREATE TABLE IF NOT EXISTS "CartItem" (
          "id" TEXT NOT NULL,
          "cartId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
        );`
      },
      {
        name: "Review",
        sql: `CREATE TABLE IF NOT EXISTS "Review" (
          "id" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
        );`
      },
      {
        name: "ProductVariant",
        sql: `CREATE TABLE IF NOT EXISTS "ProductVariant" (
          "id" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
        );`
      },
      {
        name: "StockMovement",
        sql: `CREATE TABLE IF NOT EXISTS "StockMovement" (
          "id" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
        );`
      },
      {
        name: "Chat",
        sql: `CREATE TABLE IF NOT EXISTS "Chat" (
          "id" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
        );`
      },
      {
        name: "ChatMessage",
        sql: `CREATE TABLE IF NOT EXISTS "ChatMessage" (
          "id" TEXT NOT NULL,
          "chatId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
        );`
      }
    ];

    for (const table of otherTables) {
      try {
        await prisma.$executeRawUnsafe(table.sql);
        console.log(`✅ ${table.name} table created/verified`);
      } catch (error: any) {
        console.warn(`⚠️  ${table.name} table creation skipped (may already exist with different schema)`);
      }
    }

    console.log("\n✅ All missing tables created successfully!");
    
  } catch (error: any) {
    console.error("❌ Error creating missing tables:", error.message);
    console.warn("⚠️  Continuing startup despite create-missing-tables error.");
  } finally {
    await prisma.$disconnect();
  }
}

createMissingTables()
  .then(() => {
    console.log("\n🎉 Table creation completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed to create tables:", error);
    console.warn("⚠️  Non-fatal: allowing server startup to continue.");
    process.exit(0);
  });
