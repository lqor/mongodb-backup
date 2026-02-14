const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

async function migrate() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('learn-apex');

    const updates = [
      // ===================================================================
      // TASK 7: AccountProcessBatch (d309) — orgCode, description, template, requirements, order
      // ===================================================================
      {
        id: "696cf3eafab54be63ea3d309",
        name: "AccountProcessBatch",
        update: {
          $set: {
            orgCode: true,
            order: 7,
            template: "// Write your code here",
            preCode: " ",
            description: "Write an 'AccountProcessBatch' class. This batch should update the Description field of all Accounts.\n\nRequirements:\n1. Create a public class named 'AccountProcessBatch' that implements Database.Batchable<sObject>\n2. The start method must return a QueryLocator that selects Id and Description from Account\n3. The execute method must accept List<Account> as the second parameter, set Description to 'Processed' for each Account, and update the list",
            delta: [
              { insert: "Write an 'AccountProcessBatch' class. This batch should update the Description field of all Accounts.\n\nRequirements:\nCreate a public class named 'AccountProcessBatch' that implements Database.Batchable<sObject>" },
              { attributes: { list: "ordered" }, insert: "\n" },
              { insert: "The start method must return a QueryLocator that selects Id and Description from Account" },
              { attributes: { list: "ordered" }, insert: "\n" },
              { insert: "The execute method must accept List<Account> as the second parameter, set Description to 'Processed' for each Account, and update the list" },
              { attributes: { list: "ordered" }, insert: "\n" }
            ],
            requirements: [
              "Create a public class named 'AccountProcessBatch' that implements Database.Batchable<sObject>",
              "The start method must return a QueryLocator that selects Id and Description from Account",
              "The execute method must accept List<Account> as the second parameter, set Description to 'Processed' for each Account, and update the list"
            ],
            updatedAt: new Date().toISOString()
          }
        }
      },

      // ===================================================================
      // TASK 8: LeadStatusBatch (d30a) — orgCode, description, template, requirements, order
      // ===================================================================
      {
        id: "696cf3eafab54be63ea3d30a",
        name: "LeadStatusBatch",
        update: {
          $set: {
            orgCode: true,
            order: 8,
            template: "// Write your code here",
            preCode: " ",
            description: "Write a 'LeadStatusBatch' class. The execute method should update Lead Description based on their Status.\n\nRequirements:\n1. Create a public class named 'LeadStatusBatch' that implements Database.Batchable<sObject>\n2. The start method must return a QueryLocator that selects Id, Status, Description from Lead where IsConverted equals false\n3. The execute method must accept List<Lead> as the second parameter and set Description to 'New lead - needs attention' if Status equals 'Open - Not Contacted'\n4. The execute method must set Description to 'In progress' if Status equals 'Working - Contacted'\n5. The execute method must set Description to 'Ready for conversion' for any other Status, and update the list",
            delta: [
              { insert: "Write a 'LeadStatusBatch' class. The execute method should update Lead Description based on their Status.\n\nRequirements:\nCreate a public class named 'LeadStatusBatch' that implements Database.Batchable<sObject>" },
              { attributes: { list: "ordered" }, insert: "\n" },
              { insert: "The start method must return a QueryLocator that selects Id, Status, Description from Lead where IsConverted equals false" },
              { attributes: { list: "ordered" }, insert: "\n" },
              { insert: "The execute method must accept List<Lead> as the second parameter and set Description to 'New lead - needs attention' if Status equals 'Open - Not Contacted'" },
              { attributes: { list: "ordered" }, insert: "\n" },
              { insert: "The execute method must set Description to 'In progress' if Status equals 'Working - Contacted'" },
              { attributes: { list: "ordered" }, insert: "\n" },
              { insert: "The execute method must set Description to 'Ready for conversion' for any other Status, and update the list" },
              { attributes: { list: "ordered" }, insert: "\n" }
            ],
            requirements: [
              "Create a public class named 'LeadStatusBatch' that implements Database.Batchable<sObject>",
              "The start method must return a QueryLocator that selects Id, Status, Description from Lead where IsConverted equals false",
              "The execute method must accept List<Lead> as the second parameter and set Description to 'New lead - needs attention' if Status equals 'Open - Not Contacted'",
              "The execute method must set Description to 'In progress' if Status equals 'Working - Contacted'",
              "The execute method must set Description to 'Ready for conversion' for any other Status, and update the list"
            ],
            updatedAt: new Date().toISOString()
          }
        }
      },

      // ===================================================================
      // TASK 9: LeadRatingBatch (d30b) — orgCode, order only
      // ===================================================================
      {
        id: "696cf3eafab54be63ea3d30b",
        name: "LeadRatingBatch",
        update: {
          $set: {
            orgCode: true,
            order: 9,
            updatedAt: new Date().toISOString()
          }
        }
      },

      // ===================================================================
      // TASK 10: ContactMailingBatch (d30c) — orgCode, order only
      // ===================================================================
      {
        id: "696cf3eafab54be63ea3d30c",
        name: "ContactMailingBatch",
        update: {
          $set: {
            orgCode: true,
            order: 10,
            updatedAt: new Date().toISOString()
          }
        }
      },

      // ===================================================================
      // TASK 11: AccountAddressBatch (d30d) — orgCode, order only
      // ===================================================================
      {
        id: "696cf3eafab54be63ea3d30d",
        name: "AccountAddressBatch",
        update: {
          $set: {
            orgCode: true,
            order: 11,
            updatedAt: new Date().toISOString()
          }
        }
      },

      // ===================================================================
      // TASK 12: OpportunityDiscountBatch (d30e) — orgCode, order only
      // ===================================================================
      {
        id: "696cf3eafab54be63ea3d30e",
        name: "OpportunityDiscountBatch",
        update: {
          $set: {
            orgCode: true,
            order: 12,
            updatedAt: new Date().toISOString()
          }
        }
      },

      // ===================================================================
      // TASK 13: OpportunityTierBatch (d30f) — orgCode, order only
      // ===================================================================
      {
        id: "696cf3eafab54be63ea3d30f",
        name: "OpportunityTierBatch",
        update: {
          $set: {
            orgCode: true,
            order: 13,
            updatedAt: new Date().toISOString()
          }
        }
      },

      // ===================================================================
      // TASK 14: CasePriorityUpdateBatch (d310) — order only
      // ===================================================================
      {
        id: "696cf3eafab54be63ea3d310",
        name: "CasePriorityUpdateBatch",
        update: {
          $set: {
            order: 14,
            updatedAt: new Date().toISOString()
          }
        }
      },

      // ===================================================================
      // TASK 15: ContactInfoSummaryBatch (d311) — order only
      // ===================================================================
      {
        id: "696cf3eafab54be63ea3d311",
        name: "ContactInfoSummaryBatch",
        update: {
          $set: {
            order: 15,
            updatedAt: new Date().toISOString()
          }
        }
      },

      // ===================================================================
      // TASK 16: LeadScoringSummaryBatch (d312) — order only
      // ===================================================================
      {
        id: "696cf3eafab54be63ea3d312",
        name: "LeadScoringSummaryBatch",
        update: {
          $set: {
            order: 16,
            updatedAt: new Date().toISOString()
          }
        }
      },
    ];

    // =====================================================================
    // PRE-FLIGHT CHECKS
    // =====================================================================
    console.log("=== PRE-FLIGHT CHECKS ===\n");

    for (const u of updates) {
      const task = await db.collection('tasks').findOne({ _id: new ObjectId(u.id) });
      if (!task) {
        console.error(`ABORT: Task ${u.id} (${u.name}) not found!`);
        return;
      }
      console.log(`✓ ${u.name} (${u.id}) exists | orgCode: ${task.orgCode} | order: ${task.order}`);
    }

    // Validate req/test counts for tasks that change requirements
    console.log("\n=== REQUIREMENT/TEST COUNT VALIDATION ===\n");
    for (const u of updates) {
      const task = await db.collection('tasks').findOne({ _id: new ObjectId(u.id) });
      const newReqs = u.update.$set.requirements || task.requirements;
      const newTests = u.update.$set.tests || task.tests;
      const match = newReqs.length === newTests.length ? "✓" : "✗ MISMATCH";
      console.log(`${match} ${u.name}: ${newReqs.length} requirements, ${newTests.length} tests`);
      if (newReqs.length !== newTests.length) {
        console.error(`ABORT: Mismatch for ${u.name}!`);
        return;
      }
    }

    // Check no System.debug in solutions (for tasks that change solutions)
    console.log("\n=== SYSTEM.DEBUG CHECK ===\n");
    for (const u of updates) {
      const task = await db.collection('tasks').findOne({ _id: new ObjectId(u.id) });
      const solution = u.update.$set.solution || task.solution;
      const hasDebug = solution.toLowerCase().includes('system.debug');
      const status = hasDebug ? "✗ CONTAINS System.debug" : "✓ Clean";
      console.log(`${status} ${u.name}`);
      if (hasDebug) {
        console.error(`ABORT: ${u.name} solution contains System.debug!`);
        return;
      }
    }

    console.log("\n=== ALL CHECKS PASSED — APPLYING CHANGES ===\n");

    // =====================================================================
    // APPLY UPDATES
    // =====================================================================
    for (const u of updates) {
      const result = await db.collection('tasks').updateOne(
        { _id: new ObjectId(u.id) },
        u.update
      );
      console.log(`${u.name} (${u.id}): matched=${result.matchedCount}, modified=${result.modifiedCount}`);
      if (result.matchedCount !== 1 || result.modifiedCount !== 1) {
        console.error(`WARNING: Unexpected result for ${u.name}!`);
      }
    }

    console.log("\n=== MIGRATION COMPLETE ===");

  } catch (err) {
    console.error("FATAL ERROR:", err.message);
    console.error(err.stack);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

migrate();
