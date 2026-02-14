const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const changes = [
  {
    id: '696cfb3dfab54be63ea3d31a',
    name: 'InactiveAccountBatch + Scheduler',
    jobName: 'Inactive Account Scheduler',
    newReq7: "Schedule the job from Setup using the Schedule Apex button with the job name 'Inactive Account Scheduler'",
    newTest7: "List<CronTrigger> jobs = [SELECT Id FROM CronTrigger WHERE CronJobDetail.Name = 'Inactive Account Scheduler'];\nAssert.isTrue(jobs.size() > 0, 'A scheduled job named Inactive Account Scheduler must exist');",
    newDescription: `Create a batch class and a scheduler class to mark old Accounts as inactive. The batch should update Account Description, and the scheduler should run the batch.

After creating both classes, schedule the job from Setup by searching for 'Apex Classes' and clicking the 'Schedule Apex' button.

Requirements:
1. Create a public class named 'InactiveAccountBatch' that implements Database.Batchable<sObject>
2. The start method must return a QueryLocator that selects Id and Description from Account where LastModifiedDate is less than LAST_N_DAYS:365
3. The execute method must set Description to 'Inactive - No activity for 1 year' for each Account and update them
4. Add an empty finish method
5. Create a public class named 'InactiveAccountScheduler' that implements Schedulable
6. The scheduler's execute method must create an instance of InactiveAccountBatch and execute it using Database.executeBatch with a batch size of 200
7. Schedule the job from Setup using the Schedule Apex button with the job name 'Inactive Account Scheduler'`,
  },
  {
    id: '696cfb3dfab54be63ea3d31d',
    name: 'CaseEscalationBatch + Scheduler',
    jobName: 'Case Escalation Scheduler',
    newReq7: "Schedule the job from Setup using the Schedule Apex button with the job name 'Case Escalation Scheduler'",
    newTest7: "List<CronTrigger> jobs = [SELECT Id FROM CronTrigger WHERE CronJobDetail.Name = 'Case Escalation Scheduler'];\nAssert.isTrue(jobs.size() > 0, 'A scheduled job named Case Escalation Scheduler must exist');",
    newDescription: `Create a batch class and a scheduler class to escalate high-priority Cases that have been open for more than 7 days. The batch should mark them as escalated.

After creating both classes, schedule the job from Setup by searching for 'Apex Classes' and clicking the 'Schedule Apex' button.

Requirements:
1. Create a public class named 'CaseEscalationBatch' that implements Database.Batchable<sObject>
2. The start method must return a QueryLocator that selects Id, IsEscalated, Subject from Case where Priority equals 'High' and Status does not equal 'Closed' and CreatedDate is less than LAST_N_DAYS:7
3. The execute method must set IsEscalated to true and append ' [AUTO-ESCALATED]' to Subject for each Case and update them
4. Add an empty finish method
5. Create a public class named 'CaseEscalationScheduler' that implements Schedulable
6. The scheduler's execute method must create an instance of CaseEscalationBatch and execute it using Database.executeBatch with a batch size of 50
7. Schedule the job from Setup using the Schedule Apex button with the job name 'Case Escalation Scheduler'`,
  },
  {
    id: '696cfb3dfab54be63ea3d31e',
    name: 'ContactTitleUpdateBatch + Scheduler',
    jobName: 'Contact Title Update Scheduler',
    newReq7: "Schedule the job from Setup using the Schedule Apex button with the job name 'Contact Title Update Scheduler'",
    newTest7: "List<CronTrigger> jobs = [SELECT Id FROM CronTrigger WHERE CronJobDetail.Name = 'Contact Title Update Scheduler'];\nAssert.isTrue(jobs.size() > 0, 'A scheduled job named Contact Title Update Scheduler must exist');",
    newDescription: `Create a batch class and a scheduler class to update Contact titles based on their Account's industry. Contacts at Technology companies should have their title prefixed with 'Tech - '.

After creating both classes, schedule the job from Setup by searching for 'Apex Classes' and clicking the 'Schedule Apex' button.

Requirements:
1. Create a public class named 'ContactTitleUpdateBatch' that implements Database.Batchable<sObject>
2. The start method must return a QueryLocator that selects Id, Title, Account.Industry from Contact where Account.Industry equals 'Technology' and Title does not equal null
3. The execute method must prefix Title with 'Tech - ' if it doesn't already start with 'Tech - ', and update the Contacts
4. Add an empty finish method
5. Create a public class named 'ContactTitleUpdateScheduler' that implements Schedulable
6. The scheduler's execute method must create an instance of ContactTitleUpdateBatch and execute it using Database.executeBatch with a batch size of 200
7. Schedule the job from Setup using the Schedule Apex button with the job name 'Contact Title Update Scheduler'`,
  },
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');

  // ========== PRE-FLIGHT CHECKS ==========
  console.log('========== PRE-FLIGHT CHECKS ==========\n');
  let allGood = true;

  for (const change of changes) {
    const task = await tasks.findOne({ _id: new ObjectId(change.id) });
    if (!task) {
      console.log(`❌ Task ${change.id} (${change.name}) NOT FOUND`);
      allGood = false;
      continue;
    }
    console.log(`✅ Found: ${change.name} (${change.id})`);
    console.log(`   Current reqs: ${task.requirements.length}, tests: ${task.tests.length}`);

    // After change, reqs and tests should still be equal (both stay at 7)
    if (task.requirements.length !== task.tests.length) {
      console.log(`   ❌ Req/test mismatch BEFORE migration!`);
      allGood = false;
    }

    // Check for System.debug in solution
    if (task.solution.includes('System.debug')) {
      console.log(`   ❌ System.debug found in solution!`);
      allGood = false;
    }
  }

  if (!allGood) {
    console.log('\n❌ Pre-flight checks failed. Aborting.');
    await client.close();
    return;
  }

  console.log('\n✅ All pre-flight checks passed.\n');

  // ========== APPLY CHANGES ==========
  console.log('========== APPLYING CHANGES ==========\n');

  for (const change of changes) {
    const task = await tasks.findOne({ _id: new ObjectId(change.id) });

    // Build new requirements array — replace last element
    const newRequirements = [...task.requirements];
    newRequirements[newRequirements.length - 1] = change.newReq7;

    // Build new tests array — replace last element
    const newTests = [...task.tests];
    newTests[newTests.length - 1] = change.newTest7;

    // Build new delta
    const newDelta = [{ insert: change.newDescription + '\n' }];

    const result = await tasks.updateOne(
      { _id: new ObjectId(change.id) },
      {
        $set: {
          description: change.newDescription,
          delta: newDelta,
          requirements: newRequirements,
          tests: newTests,
        },
      }
    );

    console.log(`${change.name} (${change.id}):`);
    console.log(`   matched: ${result.matchedCount}, modified: ${result.modifiedCount}`);
    console.log(`   New req 7: ${change.newReq7}`);
    console.log(`   New test 7: ${change.newTest7.substring(0, 80)}...`);
    console.log();
  }

  // ========== VERIFICATION ==========
  console.log('========== VERIFICATION ==========\n');

  for (const change of changes) {
    const task = await tasks.findOne({ _id: new ObjectId(change.id) });
    console.log(`${change.name} (${change.id}):`);
    console.log(`   Reqs: ${task.requirements.length}, Tests: ${task.tests.length}`);
    console.log(`   Req 7: ${task.requirements[task.requirements.length - 1]}`);
    console.log(`   Test 7: ${task.tests[task.tests.length - 1].substring(0, 100)}...`);
    console.log(`   Description ends with: ...${task.description.slice(-80)}`);
    console.log(`   Req/test match: ${task.requirements.length === task.tests.length ? '✅' : '❌'}`);
    console.log();
  }

  await client.close();
  console.log('Done!');
}

main().catch(console.error);
