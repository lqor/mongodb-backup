const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');
  const topics = db.collection('topics');

  const TOPIC_ID = '6990bbd44dc3a532eb9ed4b0';

  // ========== PRE-FLIGHT CHECKS ==========
  console.log('========== PRE-FLIGHT CHECKS ==========\n');

  // 1. Verify topic exists
  const topic = await topics.findOne({ _id: new ObjectId(TOPIC_ID) });
  if (!topic) {
    console.log('❌ Topic not found!');
    await client.close();
    return;
  }
  console.log(`✅ Topic found: "${topic.topicName}"`);
  console.log(`   Current tasks: ${topic.tasks.length}`);

  // 2. Load tasks JSON
  const newTasks = JSON.parse(fs.readFileSync('pokemon-tasks-batch1.json', 'utf8'));
  console.log(`✅ Loaded ${newTasks.length} tasks from JSON`);

  // 3. Validate each task
  for (let i = 0; i < newTasks.length; i++) {
    const t = newTasks[i];
    const reqCount = t.requirements.length;
    const testCount = t.tests.length;

    if (reqCount !== testCount) {
      console.log(`❌ Task ${i + 1}: req count (${reqCount}) != test count (${testCount})`);
      await client.close();
      return;
    }

    if (t.solution.includes('System.debug')) {
      console.log(`❌ Task ${i + 1}: solution contains System.debug`);
      await client.close();
      return;
    }

    if (t.solution.includes('System.assert') || t.solution.includes('System.assertEquals')) {
      console.log(`❌ Task ${i + 1}: solution contains System.assert`);
      await client.close();
      return;
    }

    if (t.ref !== TOPIC_ID) {
      console.log(`❌ Task ${i + 1}: ref "${t.ref}" doesn't match topic ID "${TOPIC_ID}"`);
      await client.close();
      return;
    }

    // Check delta matches description
    const deltaText = t.delta[0].insert.trim();
    const descText = t.description.trim();
    if (deltaText !== descText) {
      console.log(`❌ Task ${i + 1}: delta doesn't match description`);
      console.log(`   Delta: "${deltaText.substring(0, 60)}..."`);
      console.log(`   Desc:  "${descText.substring(0, 60)}..."`);
      await client.close();
      return;
    }

    console.log(`✅ Task ${i + 1} (order ${t.order}): ${reqCount} reqs, ${testCount} tests, no System.debug/assert, delta matches`);
  }

  // ========== INSERT TASKS ==========
  console.log('\n========== INSERTING TASKS ==========\n');

  const insertResult = await tasks.insertMany(newTasks);
  const insertedIds = Object.values(insertResult.insertedIds).map(id => String(id));
  console.log(`✅ Inserted ${insertedIds.length} tasks`);
  insertedIds.forEach((id, i) => console.log(`   Task ${i + 1} (order ${newTasks[i].order}): ${id}`));

  // ========== UPDATE TOPIC ==========
  console.log('\n========== UPDATING TOPIC TASKS ARRAY ==========\n');

  const updateResult = await topics.updateOne(
    { _id: new ObjectId(TOPIC_ID) },
    { $push: { tasks: { $each: insertedIds } } }
  );

  if (updateResult.modifiedCount === 1) {
    console.log(`✅ Added ${insertedIds.length} task IDs to topic tasks array (as strings)`);
  } else {
    console.log(`❌ Failed to update topic (matched: ${updateResult.matchedCount}, modified: ${updateResult.modifiedCount})`);
  }

  // ========== VERIFICATION ==========
  console.log('\n========== VERIFICATION ==========\n');

  const verifyTopic = await topics.findOne({ _id: new ObjectId(TOPIC_ID) });
  console.log(`Topic "${verifyTopic.topicName}" now has ${verifyTopic.tasks.length} tasks`);
  console.log(`Tasks array: ${JSON.stringify(verifyTopic.tasks)}`);

  // Verify each inserted task
  for (const id of insertedIds) {
    const task = await tasks.findOne({ _id: new ObjectId(id) });
    console.log(`\n  ✅ ${id} — order ${task.order}: "${task.description.substring(0, 60)}..."`);
    console.log(`     reqs: ${task.requirements.length} | tests: ${task.tests.length} | orgCode: ${task.orgCode} | ref: ${task.ref}`);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
