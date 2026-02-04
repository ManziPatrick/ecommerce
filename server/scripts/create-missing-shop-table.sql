-- Safe migration to create Shop table if it doesn't exist
-- This will not affect existing data

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

-- Create unique constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Shop_name_key') THEN
        ALTER TABLE "Shop" ADD CONSTRAINT "Shop_name_key" UNIQUE ("name");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Shop_slug_key') THEN
        ALTER TABLE "Shop" ADD CONSTRAINT "Shop_slug_key" UNIQUE ("slug");
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "Shop_name_slug_ownerId_idx" ON "Shop"("name", "slug", "ownerId");

-- Add foreign key if it doesn't exist
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
