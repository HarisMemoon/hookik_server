import Transaction from "./src/models/Transaction.js";
import { coreDB } from "./src/config/database.js";

const descriptions = [
  "Monthly Creator Payout",
  "Brand Referral Bonus",
  "Withdrawal Request",
  "Campaign Earnings",
  "Marketplace Revenue",
];

async function seedPayouts() {
  try {
    // 1. Establish Connection
    await coreDB.authenticate();
    console.log("Connected to database for seeding...");

    const payoutRecords = [];

    // 2. Generate 10 Pending Records
    for (let i = 0; i < 10; i++) {
      payoutRecords.push({
        user_id: 2284,
        wallet_id: 10,
        amount: (Math.random() * (50000 - 1000) + 1000).toFixed(2),
        status: "pending", // Strictly set to pending
        type: "payout",
        description:
          descriptions[Math.floor(Math.random() * descriptions.length)],
        created_at: new Date(),
        updated_at: new Date(),
        // Storing as a plain object; Sequelize will handle the JSON stringification
        metadata: { note: "Manual Test Seed", attempt: i + 1 },
      });
    }

    // 3. Bulk Insert
    await Transaction.bulkCreate(payoutRecords);

    console.log("✅ Successfully inserted 10 PENDING payout records!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedPayouts();
