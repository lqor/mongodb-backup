const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

const OLD_TOPIC_ID = "69693440d331617a8ce8abd4"; // The Batchable Interface
const NEW_TOPIC_ID = "69693440d331617a8ce8abd6"; // The Execute Method

// Task IDs as strings (will use ObjectId for _id queries, strings for ref field)
const TASK_IDS = [
  "696ceff3fab54be63ea3d301", // SimpleBatch
  "696ceff3fab54be63ea3d302", // AccountQueryBatch
  "696ceff3fab54be63ea3d303", // ContactFilterBatch
  "696ceff3fab54be63ea3d304", // LeadProcessBatch
  "696ceff3fab54be63ea3d305", // AccountDescriptionBatch
  "696ceff3fab54be63ea3d306", // OpportunityCloseDateBatch
];

async function migrate() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('learn-apex');

    // =====================================================================
    // TASK UPDATES — ref is a STRING field, _id queries use ObjectId
    // =====================================================================

    // TASK 1: SimpleBatch
    const task1Update = {
      $set: {
        orgCode: true,
        ref: NEW_TOPIC_ID,  // string
        order: 1,
        template: "// Write your code here",
        preCode: " ",
        description: "Write a 'SimpleBatch' class that implements the Database.Batchable<sObject> interface.\n\nRequirements:\n1. Create a public class named 'SimpleBatch' that implements Database.Batchable<sObject>\n2. The start method must return a QueryLocator that selects Id from Account LIMIT 1\n3. The execute method must exist and accept the correct parameters\n4. The finish method must exist",
        delta: [
          { insert: "Write a 'SimpleBatch' class that implements the Database.Batchable<sObject> interface.\n\nRequirements:\nCreate a public class named 'SimpleBatch' that implements Database.Batchable<sObject>" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The start method must return a QueryLocator that selects Id from Account LIMIT 1" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The execute method must exist and accept the correct parameters" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The finish method must exist" },
          { attributes: { list: "ordered" }, insert: "\n" }
        ],
        requirements: [
          "Create a public class named 'SimpleBatch' that implements Database.Batchable<sObject>",
          "The start method must return a QueryLocator that selects Id from Account LIMIT 1",
          "The execute method must exist and accept the correct parameters",
          "The finish method must exist"
        ],
        solution: "public class SimpleBatch implements Database.Batchable<sObject> {\n    public Database.QueryLocator start(Database.BatchableContext context) {\n        return Database.getQueryLocator([SELECT Id FROM Account LIMIT 1]);\n    }\n    \n    public void execute(Database.BatchableContext context, List<sObject> scope) {\n    }\n    \n    public void finish(Database.BatchableContext context) {\n    }\n}",
        tests: [
          "SimpleBatch batch = new SimpleBatch();\nAssert.isNotNull(batch, 'SimpleBatch class must implement Database.Batchable<sObject>');",
          "SimpleBatch batch = new SimpleBatch();\nDatabase.QueryLocator locator = batch.start(null);\nAssert.isNotNull(locator, 'start method must return a QueryLocator');",
          "SimpleBatch batch = new SimpleBatch();\nbatch.execute(null, new List<sObject>());\nAssert.isNotNull(batch, 'execute method must exist and accept correct parameters');",
          "SimpleBatch batch = new SimpleBatch();\nbatch.finish(null);\nAssert.isNotNull(batch, 'finish method must exist and accept correct parameters');"
        ],
        updatedAt: new Date().toISOString()
      }
    };

    // TASK 2: AccountQueryBatch
    const task2Update = {
      $set: {
        ref: NEW_TOPIC_ID,
        order: 2,
        description: "Write an 'AccountQueryBatch' class. This batch should query all Account records.\n\nRequirements:\n1. Create a public class named 'AccountQueryBatch' that implements Database.Batchable<sObject>\n2. The start method must return a QueryLocator that selects Id and Name from Account\n3. The execute method must exist and accept the correct parameters\n4. The finish method must exist",
        delta: [
          { insert: "Write an 'AccountQueryBatch' class. This batch should query all Account records.\n\nRequirements:\nCreate a public class named 'AccountQueryBatch' that implements Database.Batchable<sObject>" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The start method must return a QueryLocator that selects Id and Name from Account" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The execute method must exist and accept the correct parameters" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The finish method must exist" },
          { attributes: { list: "ordered" }, insert: "\n" }
        ],
        requirements: [
          "Create a public class named 'AccountQueryBatch' that implements Database.Batchable<sObject>",
          "The start method must return a QueryLocator that selects Id and Name from Account",
          "The execute method must exist and accept the correct parameters",
          "The finish method must exist"
        ],
        solution: "public class AccountQueryBatch implements Database.Batchable<sObject> {\n    public Database.QueryLocator start(Database.BatchableContext context) {\n        return Database.getQueryLocator([SELECT Id, Name FROM Account]);\n    }\n    \n    public void execute(Database.BatchableContext context, List<sObject> scope) {\n    }\n    \n    public void finish(Database.BatchableContext context) {\n    }\n}",
        tests: [
          "AccountQueryBatch batch = new AccountQueryBatch();\nAssert.isNotNull(batch, 'AccountQueryBatch class must exist');",
          "AccountQueryBatch batch = new AccountQueryBatch();\nDatabase.QueryLocator locator = batch.start(null);\nAssert.isNotNull(locator, 'start method must return a QueryLocator');",
          "AccountQueryBatch batch = new AccountQueryBatch();\nbatch.execute(null, new List<sObject>());\nAssert.isNotNull(batch, 'execute method must exist');",
          "AccountQueryBatch batch = new AccountQueryBatch();\nbatch.finish(null);\nAssert.isNotNull(batch, 'finish method must exist');"
        ],
        updatedAt: new Date().toISOString()
      }
    };

    // TASK 3: ContactFilterBatch
    const task3Update = {
      $set: {
        ref: NEW_TOPIC_ID,
        order: 3,
        description: "Write a 'ContactFilterBatch' class. This batch should query Contacts that have an email address.\n\nRequirements:\n1. Create a public class named 'ContactFilterBatch' that implements Database.Batchable<sObject>\n2. The start method must return a QueryLocator that selects Id, FirstName, LastName, Email from Contact where Email is not null\n3. The execute method must accept List<Contact> as the second parameter and loop through the contacts\n4. The finish method must exist",
        delta: [
          { insert: "Write a 'ContactFilterBatch' class. This batch should query Contacts that have an email address.\n\nRequirements:\nCreate a public class named 'ContactFilterBatch' that implements Database.Batchable<sObject>" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The start method must return a QueryLocator that selects Id, FirstName, LastName, Email from Contact where Email is not null" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The execute method must accept List<Contact> as the second parameter and loop through the contacts" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The finish method must exist" },
          { attributes: { list: "ordered" }, insert: "\n" }
        ],
        requirements: [
          "Create a public class named 'ContactFilterBatch' that implements Database.Batchable<sObject>",
          "The start method must return a QueryLocator that selects Id, FirstName, LastName, Email from Contact where Email is not null",
          "The execute method must accept List<Contact> as the second parameter and loop through the contacts",
          "The finish method must exist"
        ],
        solution: "public class ContactFilterBatch implements Database.Batchable<sObject> {\n    public Database.QueryLocator start(Database.BatchableContext context) {\n        return Database.getQueryLocator([SELECT Id, FirstName, LastName, Email FROM Contact WHERE Email != null]);\n    }\n    \n    public void execute(Database.BatchableContext context, List<Contact> contacts) {\n        for (Contact record : contacts) {\n        }\n    }\n    \n    public void finish(Database.BatchableContext context) {\n    }\n}",
        tests: [
          "ContactFilterBatch batch = new ContactFilterBatch();\nAssert.isNotNull(batch, 'ContactFilterBatch class must exist and implement Database.Batchable<sObject>');",
          "ContactFilterBatch batch = new ContactFilterBatch();\nDatabase.QueryLocator locator = batch.start(null);\nAssert.isNotNull(locator, 'start method must return a QueryLocator');",
          "Account account = new Account(Name = 'Test Account');\ninsert account;\nContact contact = new Contact(LastName = 'Test', Email = 'test@example.com', AccountId = account.Id);\ninsert contact;\nContactFilterBatch batch = new ContactFilterBatch();\nbatch.execute(null, new List<Contact>{contact});\ndelete contact;\ndelete account;\nAssert.isNotNull(batch, 'execute method must process Contact records');",
          "ContactFilterBatch batch = new ContactFilterBatch();\nbatch.finish(null);\nAssert.isNotNull(batch, 'finish method must exist');"
        ],
        updatedAt: new Date().toISOString()
      }
    };

    // TASK 4: LeadProcessBatch
    const task4Update = {
      $set: {
        orgCode: true,
        ref: NEW_TOPIC_ID,
        order: 4,
        template: "// Write your code here",
        preCode: " ",
        description: "Write a 'LeadProcessBatch' class. This batch should query unconverted Leads and update their Description.\n\nRequirements:\n1. Create a public class named 'LeadProcessBatch' that implements Database.Batchable<sObject>\n2. The start method must return a QueryLocator that selects Id, Name, Status, Description from Lead where IsConverted equals false\n3. The execute method must accept List<Lead> as the second parameter, set Description to 'Processed by batch' for each Lead, and update the list",
        delta: [
          { insert: "Write a 'LeadProcessBatch' class. This batch should query unconverted Leads and update their Description.\n\nRequirements:\nCreate a public class named 'LeadProcessBatch' that implements Database.Batchable<sObject>" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The start method must return a QueryLocator that selects Id, Name, Status, Description from Lead where IsConverted equals false" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The execute method must accept List<Lead> as the second parameter, set Description to 'Processed by batch' for each Lead, and update the list" },
          { attributes: { list: "ordered" }, insert: "\n" }
        ],
        requirements: [
          "Create a public class named 'LeadProcessBatch' that implements Database.Batchable<sObject>",
          "The start method must return a QueryLocator that selects Id, Name, Status, Description from Lead where IsConverted equals false",
          "The execute method must accept List<Lead> as the second parameter, set Description to 'Processed by batch' for each Lead, and update the list"
        ],
        solution: "public class LeadProcessBatch implements Database.Batchable<sObject> {\n    public Database.QueryLocator start(Database.BatchableContext context) {\n        return Database.getQueryLocator([SELECT Id, Name, Status, Description FROM Lead WHERE IsConverted = false]);\n    }\n    \n    public void execute(Database.BatchableContext context, List<Lead> leads) {\n        for (Lead lead : leads) {\n            lead.Description = 'Processed by batch';\n        }\n        update leads;\n    }\n    \n    public void finish(Database.BatchableContext context) {\n    }\n}",
        tests: [
          "LeadProcessBatch batch = new LeadProcessBatch();\nDatabase.QueryLocator locator = batch.start(null);\nAssert.isNotNull(locator, 'start method must return a QueryLocator');",
          "Lead lead = new Lead(LastName = 'Test Lead', Company = 'Test Company');\ninsert lead;\nLeadProcessBatch batch = new LeadProcessBatch();\nbatch.execute(null, new List<Lead>{lead});\nLead result = [SELECT Description FROM Lead WHERE Id = :lead.Id];\nString description = result.Description;\ndelete lead;\nAssert.areEqual('Processed by batch', description, 'execute method must update Lead Description');",
          "LeadProcessBatch batch = new LeadProcessBatch();\nbatch.finish(null);\nAssert.isNotNull(batch, 'finish method must exist');"
        ],
        updatedAt: new Date().toISOString()
      }
    };

    // TASK 5: AccountDescriptionBatch
    const task5Update = {
      $set: {
        ref: NEW_TOPIC_ID,
        order: 5,
        description: "Write an 'AccountDescriptionBatch' class. This batch should update the Description field of all Accounts.\n\nRequirements:\n1. Create a public class named 'AccountDescriptionBatch' that implements Database.Batchable<sObject>\n2. The start method must return a QueryLocator that selects Id and Description from Account\n3. The execute method must accept List<Account> as the second parameter, set Description to 'Updated by batch' for each Account, and update the list\n4. The finish method must exist",
        delta: [
          { insert: "Write an 'AccountDescriptionBatch' class. This batch should update the Description field of all Accounts.\n\nRequirements:\nCreate a public class named 'AccountDescriptionBatch' that implements Database.Batchable<sObject>" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The start method must return a QueryLocator that selects Id and Description from Account" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The execute method must accept List<Account> as the second parameter, set Description to 'Updated by batch' for each Account, and update the list" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The finish method must exist" },
          { attributes: { list: "ordered" }, insert: "\n" }
        ],
        requirements: [
          "Create a public class named 'AccountDescriptionBatch' that implements Database.Batchable<sObject>",
          "The start method must return a QueryLocator that selects Id and Description from Account",
          "The execute method must accept List<Account> as the second parameter, set Description to 'Updated by batch' for each Account, and update the list",
          "The finish method must exist"
        ],
        solution: "public class AccountDescriptionBatch implements Database.Batchable<sObject> {\n    public Database.QueryLocator start(Database.BatchableContext context) {\n        return Database.getQueryLocator([SELECT Id, Description FROM Account]);\n    }\n    \n    public void execute(Database.BatchableContext context, List<Account> accounts) {\n        for (Account account : accounts) {\n            account.Description = 'Updated by batch';\n        }\n        update accounts;\n    }\n    \n    public void finish(Database.BatchableContext context) {\n    }\n}",
        tests: [
          "AccountDescriptionBatch batch = new AccountDescriptionBatch();\nAssert.isNotNull(batch, 'AccountDescriptionBatch class must exist and implement Database.Batchable<sObject>');",
          "AccountDescriptionBatch batch = new AccountDescriptionBatch();\nDatabase.QueryLocator locator = batch.start(null);\nAssert.isNotNull(locator, 'start method must return a QueryLocator');",
          "Account account = new Account(Name = 'Test Batch Account');\ninsert account;\nAccountDescriptionBatch batch = new AccountDescriptionBatch();\nbatch.execute(null, new List<Account>{account});\nAccount result = [SELECT Description FROM Account WHERE Id = :account.Id];\nString description = result.Description;\ndelete account;\nAssert.areEqual('Updated by batch', description, 'execute method must update Account Description');",
          "AccountDescriptionBatch batch = new AccountDescriptionBatch();\nbatch.finish(null);\nAssert.isNotNull(batch, 'finish method must exist');"
        ],
        updatedAt: new Date().toISOString()
      }
    };

    // TASK 6: OpportunityCloseDateBatch
    const task6Update = {
      $set: {
        ref: NEW_TOPIC_ID,
        order: 6,
        description: "Write an 'OpportunityCloseDateBatch' class. This batch should update Opportunities that are past their CloseDate.\n\nRequirements:\n1. Create a public class named 'OpportunityCloseDateBatch' that implements Database.Batchable<sObject>\n2. The start method must return a QueryLocator that selects Id, Name, CloseDate, Description from Opportunity where CloseDate is less than TODAY and IsClosed equals false\n3. The execute method must accept List<Opportunity> as the second parameter, set Description to 'Past due - needs attention' for each Opportunity, and update the list\n4. The finish method must exist",
        delta: [
          { insert: "Write an 'OpportunityCloseDateBatch' class. This batch should update Opportunities that are past their CloseDate.\n\nRequirements:\nCreate a public class named 'OpportunityCloseDateBatch' that implements Database.Batchable<sObject>" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The start method must return a QueryLocator that selects Id, Name, CloseDate, Description from Opportunity where CloseDate is less than TODAY and IsClosed equals false" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The execute method must accept List<Opportunity> as the second parameter, set Description to 'Past due - needs attention' for each Opportunity, and update the list" },
          { attributes: { list: "ordered" }, insert: "\n" },
          { insert: "The finish method must exist" },
          { attributes: { list: "ordered" }, insert: "\n" }
        ],
        requirements: [
          "Create a public class named 'OpportunityCloseDateBatch' that implements Database.Batchable<sObject>",
          "The start method must return a QueryLocator that selects Id, Name, CloseDate, Description from Opportunity where CloseDate is less than TODAY and IsClosed equals false",
          "The execute method must accept List<Opportunity> as the second parameter, set Description to 'Past due - needs attention' for each Opportunity, and update the list",
          "The finish method must exist"
        ],
        solution: "public class OpportunityCloseDateBatch implements Database.Batchable<sObject> {\n    public Database.QueryLocator start(Database.BatchableContext context) {\n        return Database.getQueryLocator([SELECT Id, Name, CloseDate, Description FROM Opportunity WHERE CloseDate < TODAY AND IsClosed = false]);\n    }\n    \n    public void execute(Database.BatchableContext context, List<Opportunity> opportunities) {\n        for (Opportunity opp : opportunities) {\n            opp.Description = 'Past due - needs attention';\n        }\n        update opportunities;\n    }\n    \n    public void finish(Database.BatchableContext context) {\n    }\n}",
        tests: [
          "OpportunityCloseDateBatch batch = new OpportunityCloseDateBatch();\nAssert.isNotNull(batch, 'OpportunityCloseDateBatch class must exist and implement Database.Batchable<sObject>');",
          "OpportunityCloseDateBatch batch = new OpportunityCloseDateBatch();\nDatabase.QueryLocator locator = batch.start(null);\nAssert.isNotNull(locator, 'start method must return a QueryLocator');",
          "Account account = new Account(Name = 'Test Account');\ninsert account;\nOpportunity opportunity = new Opportunity(Name = 'Test Opp', StageName = 'Prospecting', CloseDate = Date.today().addDays(-10), AccountId = account.Id);\ninsert opportunity;\nOpportunityCloseDateBatch batch = new OpportunityCloseDateBatch();\nbatch.execute(null, new List<Opportunity>{opportunity});\nOpportunity result = [SELECT Description FROM Opportunity WHERE Id = :opportunity.Id];\nString description = result.Description;\ndelete opportunity;\ndelete account;\nAssert.areEqual('Past due - needs attention', description, 'execute method must update Opportunity Description');",
          "OpportunityCloseDateBatch batch = new OpportunityCloseDateBatch();\nbatch.finish(null);\nAssert.isNotNull(batch, 'finish method must exist');"
        ],
        updatedAt: new Date().toISOString()
      }
    };

    // =====================================================================
    // PRE-FLIGHT CHECKS
    // =====================================================================
    console.log("=== PRE-FLIGHT CHECKS ===\n");

    // Verify all 6 tasks exist (using ObjectId)
    for (const id of TASK_IDS) {
      const task = await db.collection('tasks').findOne({ _id: new ObjectId(id) });
      if (!task) {
        console.error(`ABORT: Task ${id} not found!`);
        return;
      }
      console.log(`✓ Task ${id} exists (ref: ${task.ref})`);
    }

    // Verify old topic exists
    const oldTopic = await db.collection('topics').findOne({ _id: new ObjectId(OLD_TOPIC_ID) });
    if (!oldTopic) {
      console.error(`ABORT: Old topic ${OLD_TOPIC_ID} not found!`);
      return;
    }
    console.log(`✓ Old topic "${oldTopic.topicName}" exists with ${oldTopic.tasks.length} tasks`);

    // Verify new topic exists
    const newTopic = await db.collection('topics').findOne({ _id: new ObjectId(NEW_TOPIC_ID) });
    if (!newTopic) {
      console.error(`ABORT: New topic ${NEW_TOPIC_ID} not found!`);
      return;
    }
    console.log(`✓ New topic "${newTopic.topicName}" exists with ${newTopic.tasks.length} tasks`);

    // Verify requirement/test count match
    const updates = [
      { id: TASK_IDS[0], name: "SimpleBatch", update: task1Update },
      { id: TASK_IDS[1], name: "AccountQueryBatch", update: task2Update },
      { id: TASK_IDS[2], name: "ContactFilterBatch", update: task3Update },
      { id: TASK_IDS[3], name: "LeadProcessBatch", update: task4Update },
      { id: TASK_IDS[4], name: "AccountDescriptionBatch", update: task5Update },
      { id: TASK_IDS[5], name: "OpportunityCloseDateBatch", update: task6Update },
    ];

    console.log("\n=== REQUIREMENT/TEST COUNT VALIDATION ===\n");
    for (const u of updates) {
      const reqCount = u.update.$set.requirements.length;
      const testCount = u.update.$set.tests.length;
      const match = reqCount === testCount ? "✓" : "✗ MISMATCH";
      console.log(`${match} ${u.name}: ${reqCount} requirements, ${testCount} tests`);
      if (reqCount !== testCount) {
        console.error(`ABORT: Requirement/test count mismatch for ${u.name}!`);
        return;
      }
    }

    // Verify no System.debug in any solution
    console.log("\n=== SYSTEM.DEBUG CHECK IN SOLUTIONS ===\n");
    for (const u of updates) {
      const hasDebug = u.update.$set.solution.toLowerCase().includes('system.debug');
      const status = hasDebug ? "✗ CONTAINS System.debug" : "✓ Clean";
      console.log(`${status} ${u.name}`);
      if (hasDebug) {
        console.error(`ABORT: Solution for ${u.name} still contains System.debug!`);
        return;
      }
    }

    console.log("\n=== ALL CHECKS PASSED — APPLYING CHANGES ===\n");

    // =====================================================================
    // APPLY TASK UPDATES (using ObjectId for _id queries)
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

    // =====================================================================
    // UPDATE OLD TOPIC: Remove all 6 task IDs from "The Batchable Interface"
    // =====================================================================
    console.log("\n=== UPDATING OLD TOPIC (Batchable Interface) ===\n");

    const oldTopicFresh = await db.collection('topics').findOne({ _id: new ObjectId(OLD_TOPIC_ID) });
    console.log(`Before: ${oldTopicFresh.tasks.length} tasks`);

    // Topic tasks array contains ObjectIds — filter them out by comparing string representations
    const taskIdSet = new Set(TASK_IDS);
    const newOldTopicTasks = oldTopicFresh.tasks.filter(t => !taskIdSet.has(t.toString()));

    const oldTopicResult = await db.collection('topics').updateOne(
      { _id: new ObjectId(OLD_TOPIC_ID) },
      { $set: { tasks: newOldTopicTasks, updatedAt: new Date().toISOString() } }
    );
    console.log(`After: ${newOldTopicTasks.length} tasks`);
    console.log(`Result: matched=${oldTopicResult.matchedCount}, modified=${oldTopicResult.modifiedCount}`);

    // =====================================================================
    // UPDATE NEW TOPIC: Add all 6 task IDs to "The Execute Method"
    // =====================================================================
    console.log("\n=== UPDATING NEW TOPIC (Execute Method) ===\n");

    const newTopicFresh = await db.collection('topics').findOne({ _id: new ObjectId(NEW_TOPIC_ID) });
    console.log(`Before: ${newTopicFresh.tasks.length} tasks`);

    // Add as ObjectIds (matching existing format), avoid duplicates
    const existingIds = new Set(newTopicFresh.tasks.map(t => t.toString()));
    const updatedNewTopicTasks = [...newTopicFresh.tasks];
    for (const id of TASK_IDS) {
      if (!existingIds.has(id)) {
        updatedNewTopicTasks.push(new ObjectId(id));
      }
    }

    const newTopicResult = await db.collection('topics').updateOne(
      { _id: new ObjectId(NEW_TOPIC_ID) },
      { $set: { tasks: updatedNewTopicTasks, updatedAt: new Date().toISOString() } }
    );
    console.log(`After: ${updatedNewTopicTasks.length} tasks`);
    console.log(`Result: matched=${newTopicResult.matchedCount}, modified=${newTopicResult.modifiedCount}`);

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
