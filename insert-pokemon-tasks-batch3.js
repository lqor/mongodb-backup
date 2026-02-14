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

  console.log('========== PRE-FLIGHT CHECKS ==========\n');

  const topic = await topics.findOne({ _id: new ObjectId(TOPIC_ID) });
  if (!topic) { console.log('❌ Topic not found!'); await client.close(); return; }
  console.log(`✅ Topic found: "${topic.topicName}" (${topic.tasks.length} existing tasks)`);

  const newTasks = JSON.parse(fs.readFileSync('pokemon-tasks-batch3.json', 'utf8'));
  console.log(`✅ Loaded ${newTasks.length} tasks from JSON`);

  for (let i = 0; i < newTasks.length; i++) {
    const t = newTasks[i];
    if (t.requirements.length !== t.tests.length) { console.log(`❌ Task order ${t.order}: req/test mismatch`); await client.close(); return; }
    if (t.solution.includes('System.debug')) { console.log(`❌ Task order ${t.order}: System.debug`); await client.close(); return; }
    if (t.solution.includes('System.assert')) { console.log(`❌ Task order ${t.order}: System.assert`); await client.close(); return; }
    if (t.ref !== TOPIC_ID) { console.log(`❌ Task order ${t.order}: ref mismatch`); await client.close(); return; }
    if (t.delta[0].insert.trim() !== t.description.trim()) { console.log(`❌ Task order ${t.order}: delta mismatch`); await client.close(); return; }
    console.log(`✅ Task order ${t.order}: ${t.requirements.length} reqs, ${t.tests.length} tests — OK`);
  }

  console.log('\n========== INSERTING TASKS ==========\n');
  const insertResult = await tasks.insertMany(newTasks);
  const insertedIds = Object.values(insertResult.insertedIds).map(id => String(id));
  console.log(`✅ Inserted ${insertedIds.length} tasks`);
  insertedIds.forEach((id, i) => console.log(`   Task order ${newTasks[i].order}: ${id}`));

  console.log('\n========== UPDATING TOPIC ==========\n');
  const updateResult = await topics.updateOne(
    { _id: new ObjectId(TOPIC_ID) },
    { $push: { tasks: { $each: insertedIds } } }
  );
  console.log(updateResult.modifiedCount === 1 ? `✅ Added ${insertedIds.length} task IDs to topic` : '❌ Failed');

  console.log('\n========== VERIFICATION ==========\n');
  const verifyTopic = await topics.findOne({ _id: new ObjectId(TOPIC_ID) });
  console.log(`Topic now has ${verifyTopic.tasks.length} tasks total`);
  for (const id of insertedIds) {
    const task = await tasks.findOne({ _id: new ObjectId(id) });
    console.log(`  ✅ order ${task.order}: "${task.description.substring(0, 70)}..." | reqs:${task.requirements.length} tests:${task.tests.length}`);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
