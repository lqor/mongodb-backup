const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const TOPIC_ID = '69693440d331617a8ce8abd9'; // Testing Batch Class

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');
  const topics = db.collection('topics');

  // ========== PRE-FLIGHT CHECKS ==========
  console.log('========== PRE-FLIGHT CHECKS ==========\n');

  // Verify topic exists
  const topic = await topics.findOne({ _id: new ObjectId(TOPIC_ID) });
  if (!topic) {
    console.log(`❌ Topic ${TOPIC_ID} NOT FOUND`);
    await client.close();
    return;
  }
  console.log(`✅ Topic found: "${topic.topicName}" (${TOPIC_ID})`);
  console.log(`   Current tasks in topic: ${topic.tasks ? topic.tasks.length : 0}`);

  // Load new tasks from JSON
  const newTasks = JSON.parse(fs.readFileSync('new-tasks-testing-batch.json', 'utf8'));
  console.log(`\n✅ Loaded ${newTasks.length} new tasks from JSON`);

  // Validate each task
  let allGood = true;
  for (let i = 0; i < newTasks.length; i++) {
    const task = newTasks[i];
    console.log(`\n--- Task ${i + 1}: order ${task.order} ---`);

    // Check req/test count
    if (task.requirements.length !== task.tests.length) {
      console.log(`   ❌ Req/test mismatch: ${task.requirements.length} reqs vs ${task.tests.length} tests`);
      allGood = false;
    } else {
      console.log(`   ✅ Req/test count: ${task.requirements.length}/${task.tests.length}`);
    }

    // Check no System.debug in solution
    if (task.solution.includes('System.debug')) {
      console.log(`   ❌ System.debug found in solution`);
      allGood = false;
    } else {
      console.log(`   ✅ No System.debug in solution`);
    }

    // Check no System.assert in solution
    if (task.solution.includes('System.assert')) {
      console.log(`   ❌ System.assert found in solution (use Assert class)`);
      allGood = false;
    } else {
      console.log(`   ✅ No System.assert in solution`);
    }

    // Check orgCode
    if (!task.orgCode) {
      console.log(`   ❌ orgCode is false (should be true for Apex tasks)`);
      allGood = false;
    } else {
      console.log(`   ✅ orgCode: true`);
    }

    // Check template is empty
    if (task.template !== '') {
      console.log(`   ❌ Template is not empty (should be empty for orgCode tasks)`);
      allGood = false;
    } else {
      console.log(`   ✅ Template is empty`);
    }

    // Check ref matches topic
    if (task.ref !== TOPIC_ID) {
      console.log(`   ❌ ref ${task.ref} doesn't match topic ${TOPIC_ID}`);
      allGood = false;
    } else {
      console.log(`   ✅ ref matches topic`);
    }
  }

  if (!allGood) {
    console.log('\n❌ Pre-flight checks failed. Aborting.');
    await client.close();
    return;
  }

  console.log('\n✅ All pre-flight checks passed.\n');

  // ========== INSERT TASKS ==========
  console.log('========== INSERTING TASKS ==========\n');

  const insertedIds = [];

  for (let i = 0; i < newTasks.length; i++) {
    const result = await tasks.insertOne(newTasks[i]);
    const insertedId = result.insertedId.toString();
    insertedIds.push(insertedId);
    console.log(`Task ${i + 1} inserted: ${insertedId} (order: ${newTasks[i].order})`);
  }

  // ========== UPDATE TOPIC ==========
  console.log('\n========== UPDATING TOPIC ==========\n');

  // Push as STRINGS, not ObjectIds!
  await topics.updateOne(
    { _id: new ObjectId(TOPIC_ID) },
    { $push: { tasks: { $each: insertedIds } } }
  );

  console.log(`Pushed ${insertedIds.length} task IDs (as strings) to topic tasks array`);

  // ========== VERIFICATION ==========
  console.log('\n========== VERIFICATION ==========\n');

  // Verify tasks exist
  for (const id of insertedIds) {
    const task = await tasks.findOne({ _id: new ObjectId(id) });
    if (task) {
      console.log(`✅ Task ${id}: order=${task.order}, reqs=${task.requirements.length}, tests=${task.tests.length}, orgCode=${task.orgCode}`);
    } else {
      console.log(`❌ Task ${id} NOT FOUND after insert!`);
    }
  }

  // Verify topic
  const updatedTopic = await topics.findOne({ _id: new ObjectId(TOPIC_ID) });
  console.log(`\nTopic "${updatedTopic.topicName}" now has ${updatedTopic.tasks.length} tasks:`);
  for (const taskId of updatedTopic.tasks) {
    const type = typeof taskId;
    console.log(`  - ${taskId} (type: ${type}) ${type === 'string' ? '✅' : '❌ NOT A STRING!'}`);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
