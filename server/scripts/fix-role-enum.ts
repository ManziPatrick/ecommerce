import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRoleEnum() {
  try {
    console.log('🔧 Checking and fixing ROLE enum...');
    
    // Add VENDOR to ROLE enum if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'ROLE' AND e.enumlabel = 'VENDOR'
        ) THEN
          ALTER TYPE "ROLE" ADD VALUE 'VENDOR';
          RAISE NOTICE 'Added VENDOR to ROLE enum';
        ELSE
          RAISE NOTICE 'VENDOR already exists in ROLE enum';
        END IF;
      END$$;
    `);
    
    console.log('✅ ROLE enum verified (VENDOR added if missing)');
  } catch (error) {
    console.error('❌ Error fixing ROLE enum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixRoleEnum()
  .then(() => {
    console.log('🎉 ROLE enum fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ ROLE enum fix failed:', error);
    process.exit(1);
  });
