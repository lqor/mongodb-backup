const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

// All async lesson IDs
const ASYNC_LESSON_IDS = [
  '695ebaa735aada7a8f2f4092', // What is Async Apex?
  '69691b55d331617a8ce8abbb', // Schedulable Apex
  '69692324d331617a8ce8abc4', // Queueables in Apex
  '6969339bd331617a8ce8abd0', // Batch Apex
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');
  const topics = db.collection('topics');
  const lessons = db.collection('lessons');

  // Get all topics in async lessons
  const allTopics = await topics.find({
    ref: { $in: ASYNC_LESSON_IDS }
  }).toArray();

  const topicIds = allTopics.map(t => String(t._id));

  // Get all active tasks in those topics
  const allTasks = await tasks.find({
    ref: { $in: topicIds },
    testMode: { $ne: true }
  }).toArray();

  console.log(`Scanning ${allTasks.length} active tasks across async module...\n`);

  // Find mismatches
  const mismatched = [];
  for (const task of allTasks) {
    if (!task.delta || !task.description) continue;
    const deltaText = task.delta[0] && task.delta[0].insert ? task.delta[0].insert.trim() : '';
    if (deltaText !== task.description.trim()) {
      mismatched.push(task);
    }
  }

  console.log(`Found ${mismatched.length} tasks with delta != description\n`);

  if (mismatched.length === 0) {
    console.log('Nothing to fix!');
    await client.close();
    return;
  }

  // Show what we'll fix
  console.log('========== TASKS TO FIX ==========\n');
  for (const task of mismatched) {
    const topic = allTopics.find(t => String(t._id) === task.ref);
    const topicName = topic ? topic.topicName : '?';
    const deltaText = task.delta[0] && task.delta[0].insert ? task.delta[0].insert : '';
    console.log(`  ${task._id} | "${topicName}" | order ${task.order || '?'}`);
    console.log(`    Description length: ${task.description.length} chars`);
    console.log(`    Delta length: ${deltaText.length} chars`);
    console.log(`    Delta is shorter by: ${task.description.length - deltaText.length} chars`);
    console.log();
  }

  // Apply fixes
  console.log('========== APPLYING FIXES ==========\n');

  let fixed = 0;
  for (const task of mismatched) {
    const newDelta = [{ insert: task.description + '\n' }];
    const result = await tasks.updateOne(
      { _id: task._id },
      { $set: { delta: newDelta } }
    );
    if (result.modifiedCount === 1) {
      fixed++;
      console.log(`  ✅ Fixed ${task._id}`);
    } else {
      console.log(`  ❌ Failed to fix ${task._id} (matched: ${result.matchedCount})`);
    }
  }

  console.log(`\nFixed ${fixed}/${mismatched.length} tasks`);

  // Verify
  console.log('\n========== VERIFICATION ==========\n');

  let verified = 0;
  for (const task of mismatched) {
    const updated = await tasks.findOne({ _id: task._id });
    const deltaText = updated.delta[0] && updated.delta[0].insert ? updated.delta[0].insert.trim() : '';
    const match = deltaText === updated.description.trim();
    if (match) {
      verified++;
      console.log(`  ✅ ${task._id} — delta matches description`);
    } else {
      console.log(`  ❌ ${task._id} — STILL MISMATCHED`);
    }
  }

  console.log(`\nVerified ${verified}/${mismatched.length} tasks`);

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
