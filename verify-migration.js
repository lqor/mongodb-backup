const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

async function verify() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('learn-apex');

    const TASK_IDS = [
      "696ceff3fab54be63ea3d301",
      "696ceff3fab54be63ea3d302",
      "696ceff3fab54be63ea3d303",
      "696ceff3fab54be63ea3d304",
      "696ceff3fab54be63ea3d305",
      "696ceff3fab54be63ea3d306",
    ];

    console.log("=== VERIFYING 6 MIGRATED TASKS ===\n");

    for (const id of TASK_IDS) {
      const task = await db.collection('tasks').findOne({ _id: new ObjectId(id) });
      console.log(`--- ${id} ---`);
      console.log(`  orgCode: ${task.orgCode}`);
      console.log(`  ref: ${task.ref} (should be 69693440d331617a8ce8abd6)`);
      console.log(`  order: ${task.order}`);
      console.log(`  template: "${task.template}"`);
      console.log(`  requirements count: ${task.requirements.length}`);
      console.log(`  tests count: ${task.tests.length}`);
      console.log(`  req == tests: ${task.requirements.length === task.tests.length ? '✓' : '✗'}`);
      console.log(`  has System.debug in solution: ${task.solution.includes('System.debug') ? '✗ YES' : '✓ NO'}`);
      console.log(`  has casting in solution: ${task.solution.includes('(List<') ? '✗ YES' : '✓ NO'}`);
      console.log(`  description starts with: "${task.description.substring(0, 60)}..."`);
      console.log();
    }

    // Verify topics
    console.log("=== VERIFYING TOPICS ===\n");

    const oldTopic = await db.collection('topics').findOne({ _id: new ObjectId("69693440d331617a8ce8abd4") });
    console.log(`Old topic "The Batchable Interface": ${oldTopic.tasks.length} tasks (should be 0)`);

    const newTopic = await db.collection('topics').findOne({ _id: new ObjectId("69693440d331617a8ce8abd6") });
    console.log(`New topic "The Execute Method": ${newTopic.tasks.length} tasks (should be 16)`);

    // Check the 6 task IDs are in the new topic
    const newTopicTaskStrings = newTopic.tasks.map(t => t.toString());
    for (const id of TASK_IDS) {
      const found = newTopicTaskStrings.includes(id);
      console.log(`  ${found ? '✓' : '✗'} ${id} in Execute Method topic`);
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
}

verify();
