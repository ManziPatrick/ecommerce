import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkMissingTables() {
  console.log("🔍 Checking which tables are missing...\n");
  
  const tables = [
    'User', 'Shop', 'Product', 'Category', 'Order', 'OrderItem',
    'Payment', 'Address', 'Cart', 'CartItem', 'Review', 'Attribute',
    'ProductVariant', 'Restock', 'StockMovement', 'Chat', 'ChatMessage'
  ];

  const missingTables: string[] = [];
  const existingTables: string[] = [];

  for (const table of tables) {
    try {
      await (prisma as any)[table.toLowerCase()].findFirst();
      existingTables.push(table);
    } catch (error: any) {
      if (error.code === 'P2021') {
        missingTables.push(table);
      }
    }
  }

  console.log("✅ Existing tables:", existingTables.join(', '));
  console.log("\n❌ Missing tables:", missingTables.join(', '));
  console.log(`\n📊 Summary: ${existingTables.length}/${tables.length} tables exist`);

  await prisma.$disconnect();
  
  return missingTables;
}

checkMissingTables()
  .then((missing) => {
    if (missing.length === 0) {
      console.log("\n🎉 All tables exist!");
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${missing.length} table(s) need to be created`);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
