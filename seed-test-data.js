const { MongoClient } = require("mongodb");

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "crms";

async function seedTestData() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const proposalsCollection = db.collection("proposals");

    // Test data
    const clientId = "CLIENT-001";
    const companyId = "COMPANY-001";

    const testProposals = [
      {
        title: "Mobile App Development",
        description:
          "Build a cross-platform mobile application using React Native",
        clientId: clientId,
        companyId: companyId,
        status: "PENDING",
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        stageHistory: [
          {
            stage: "PENDING",
            changedBy: companyId,
            changeType: "COMPANY_CREATED",
            changedAt: new Date(),
            notes: "Proposal created by company",
          },
        ],
      },
      {
        title: "Cloud Migration",
        description:
          "Migrate existing infrastructure to AWS with zero downtime",
        clientId: clientId,
        companyId: companyId,
        status: "PENDING",
        rejectionReason: null,
        createdAt: new Date("2026-03-25"),
        updatedAt: new Date("2026-03-25"),
        stageHistory: [
          {
            stage: "PENDING",
            changedBy: companyId,
            changeType: "COMPANY_CREATED",
            changedAt: new Date("2026-03-25"),
            notes: "Proposal created by company",
          },
        ],
      },
      {
        title: "Data Analytics Dashboard",
        description:
          "Create real-time analytics dashboard with Power BI integration",
        clientId: clientId,
        companyId: companyId,
        status: "PENDING",
        rejectionReason: null,
        createdAt: new Date("2026-03-20"),
        updatedAt: new Date("2026-03-20"),
        stageHistory: [
          {
            stage: "PENDING",
            changedBy: companyId,
            changeType: "COMPANY_CREATED",
            changedAt: new Date("2026-03-20"),
            notes: "Proposal created by company",
          },
        ],
      },
    ];

    // Insert test proposals
    const result = await proposalsCollection.insertMany(testProposals);
    console.log(`\n✅ Test proposals created!`);
    console.log(`📝 Inserted ${result.insertedIds.length} proposals`);
    console.log(`\n🔑 Client ID: ${clientId}`);
    console.log(`🏢 Company ID: ${companyId}`);

    // Show inserted data
    const inserted = await proposalsCollection.find({ clientId }).toArray();
    console.log(`\n📋 Proposals in database:`);
    inserted.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title} (${p.status})`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
    console.log("\n✅ Done! Now copy the Client ID to your browser.");
  }
}

seedTestData();
