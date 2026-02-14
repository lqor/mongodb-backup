const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const TOPIC_ID = '6990bbd44dc3a532eb9ed4b0';
const TASK_TO_HIDE = '6990c9dde5f75a8fde19f8d3'; // order 1 — generic HttpRequest, too basic

const TEST_FIXES = {
  '6990c9dde5f75a8fde19f8d4': { // old order 2 → new order 1 (setEndpoint)
    tests: [
      "Assert.areEqual('https://pokeapi.co/api/v2/pokemon/pikachu', request.getEndpoint(), 'Endpoint must be the Pikachu API URL');"
    ]
  },
  '6990c9dde5f75a8fde19f8d5': { // old order 3 → new order 2 (setMethod)
    tests: [
      "Assert.areEqual('GET', request.getMethod(), 'HTTP method must be GET');"
    ]
  },
  '6990c9dde5f75a8fde19f8d6': { // old order 4 → new order 3 (http.send)
    tests: [
      "Assert.isNotNull(response, 'Response must not be null');"
    ]
  },
  '6990c9dde5f75a8fde19f8d7': { // old order 5 → new order 4 (getStatusCode)
    tests: [
      "Assert.areEqual(200, statusCode, 'Status code must be 200');"
    ]
  },
  '6990ca1577ef2a308e98639c': { // old order 6 → new order 5 (getBody)
    tests: [
      "Assert.isTrue(body.length() > 0, 'Response body must not be empty');"
    ]
  },
  '6990ca1577ef2a308e98639d': { // old order 7 → new order 6 (deserializeUntyped)
    tests: [
      "Assert.isNotNull(result, 'Deserialized result must not be null');"
    ]
  },
  '6990ca1577ef2a308e98639e': { // old order 8 → new order 7 (cast to Map)
    tests: [
      "Assert.isNotNull(pokemon, 'Result must be cast to Map<String, Object>');"
    ]
  },
  '6990ca1577ef2a308e98639f': { // old order 9 → new order 8 (extract name)
    tests: [
      "Assert.areEqual('pikachu', name, 'Name must be pikachu');"
    ]
  },
  '6990ca1577ef2a308e9863a0': { // old order 10 → new order 9 (extract weight)
    tests: [
      "Assert.isTrue(weight > 0, 'Weight must be greater than 0');"
    ]
  },
  '6990d729dda409bac9885ed7': { // old order 11 → new order 10 (name + height)
    tests: [
      "Assert.isNotNull(pokemon, 'pokemon map must not be null');",
      "Assert.areEqual('pikachu', name, 'Name must be pikachu');",
      "Assert.isTrue(height > 0, 'Height must be greater than 0');"
    ]
  },
  '6990d729dda409bac9885ed8': { // old order 12 → new order 11 (base_experience)
    tests: [
      "Assert.isNotNull(pokemon, 'pokemon map must not be null');",
      "Assert.isTrue(baseExp > 0, 'base_experience must be greater than 0');"
    ]
  },
  '6990d729dda409bac9885ed9': { // old order 13 → new order 12 (cast types list)
    tests: [
      "Assert.isTrue(types.size() > 0, 'Types list must not be empty');"
    ]
  },
  '6990d729dda409bac9885eda': { // old order 14 → new order 13 (nested type name)
    tests: [
      "Assert.isTrue(types.size() > 0, 'Types list must not be empty');",
      "Assert.isNotNull(firstType, 'First type entry must not be null');",
      "Assert.isNotNull(typeInfo, 'Type info object must not be null');",
      "Assert.areEqual('electric', typeName, 'Pikachu type name must be electric');"
    ]
  }
};

// All tasks that need reordering (old order → new order)
const ORDER_MAP = [
  { id: '6990c9dde5f75a8fde19f8d4', newOrder: 1 },
  { id: '6990c9dde5f75a8fde19f8d5', newOrder: 2 },
  { id: '6990c9dde5f75a8fde19f8d6', newOrder: 3 },
  { id: '6990c9dde5f75a8fde19f8d7', newOrder: 4 },
  { id: '6990ca1577ef2a308e98639c', newOrder: 5 },
  { id: '6990ca1577ef2a308e98639d', newOrder: 6 },
  { id: '6990ca1577ef2a308e98639e', newOrder: 7 },
  { id: '6990ca1577ef2a308e98639f', newOrder: 8 },
  { id: '6990ca1577ef2a308e9863a0', newOrder: 9 },
  { id: '6990d729dda409bac9885ed7', newOrder: 10 },
  { id: '6990d729dda409bac9885ed8', newOrder: 11 },
  { id: '6990d729dda409bac9885ed9', newOrder: 12 },
  { id: '6990d729dda409bac9885eda', newOrder: 13 },
  { id: '6990d73c5b5c7cbef54ad84e', newOrder: 14 },
  { id: '6990d73c5b5c7cbef54ad84f', newOrder: 15 },
  { id: '6990d73c5b5c7cbef54ad850', newOrder: 16 },
  { id: '6990d73c5b5c7cbef54ad851', newOrder: 17 },
  { id: '6990d73c5b5c7cbef54ad852', newOrder: 18 },
  { id: '6990d73c5b5c7cbef54ad853', newOrder: 19 },
  { id: '6990d73c5b5c7cbef54ad854', newOrder: 20 },
  { id: '6990d73c5b5c7cbef54ad855', newOrder: 21 },
  { id: '6990d73c5b5c7cbef54ad856', newOrder: 22 },
  { id: '6990d73c5b5c7cbef54ad857', newOrder: 23 },
  { id: '6990d73c5b5c7cbef54ad858', newOrder: 24 }
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');
  const topics = db.collection('topics');

  console.log('========== PRE-FLIGHT CHECKS ==========\n');

  // Verify topic exists
  const topic = await topics.findOne({ _id: new ObjectId(TOPIC_ID) });
  if (!topic) { console.log('❌ Topic not found!'); await client.close(); return; }
  console.log(`✅ Topic found: "${topic.topicName}" (${topic.tasks.length} tasks)`);

  // Verify task to hide exists
  const taskToHide = await tasks.findOne({ _id: new ObjectId(TASK_TO_HIDE) });
  if (!taskToHide) { console.log('❌ Task to hide not found!'); await client.close(); return; }
  console.log(`✅ Task to hide: order ${taskToHide.order} | "${taskToHide.description.substring(0, 50)}..."`);

  // Verify all tasks in ORDER_MAP exist
  for (const entry of ORDER_MAP) {
    const t = await tasks.findOne({ _id: new ObjectId(entry.id) });
    if (!t) { console.log(`❌ Task ${entry.id} not found!`); await client.close(); return; }
  }
  console.log(`✅ All ${ORDER_MAP.length} tasks to reorder exist`);

  // Verify test fix counts match requirements
  for (const [taskId, fix] of Object.entries(TEST_FIXES)) {
    const t = await tasks.findOne({ _id: new ObjectId(taskId) });
    if (fix.tests.length !== t.requirements.length) {
      console.log(`❌ Task ${taskId} (order ${t.order}): test count ${fix.tests.length} != req count ${t.requirements.length}`);
      await client.close();
      return;
    }
  }
  console.log(`✅ All ${Object.keys(TEST_FIXES).length} test fixes have matching req/test counts`);

  // Verify no System.debug or System.assert in test fixes
  for (const [taskId, fix] of Object.entries(TEST_FIXES)) {
    for (const test of fix.tests) {
      if (test.includes('System.debug')) { console.log(`❌ Task ${taskId}: System.debug in test`); await client.close(); return; }
      if (test.includes('System.assert')) { console.log(`❌ Task ${taskId}: System.assert in test`); await client.close(); return; }
    }
  }
  console.log('✅ No System.debug or System.assert in test fixes');

  console.log('\n========== STEP 1: HIDE TASK 1 ==========\n');

  const hideResult = await tasks.updateOne(
    { _id: new ObjectId(TASK_TO_HIDE) },
    { $set: { testMode: true } }
  );
  console.log(hideResult.modifiedCount === 1 ? '✅ Set testMode: true on task 1' : '❌ Failed to hide task 1');

  console.log('\n========== STEP 2: REMOVE TASK 1 FROM TOPIC ==========\n');

  const newTasksArray = topic.tasks.filter(id => id !== TASK_TO_HIDE);
  console.log(`  Before: ${topic.tasks.length} tasks | After: ${newTasksArray.length} tasks`);
  const topicUpdate = await topics.updateOne(
    { _id: new ObjectId(TOPIC_ID) },
    { $set: { tasks: newTasksArray } }
  );
  console.log(topicUpdate.modifiedCount === 1 ? '✅ Removed task 1 from topic tasks array' : '❌ Failed to update topic');

  console.log('\n========== STEP 3: FIX TESTS ==========\n');

  for (const [taskId, fix] of Object.entries(TEST_FIXES)) {
    const result = await tasks.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { tests: fix.tests } }
    );
    const t = await tasks.findOne({ _id: new ObjectId(taskId) });
    console.log(result.modifiedCount === 1
      ? `✅ Fixed tests for order ${t.order} → ${fix.tests.length} assertion-only tests`
      : `⚠️  No change for order ${t.order} (tests may already be correct)`);
  }

  console.log('\n========== STEP 4: REORDER TASKS ==========\n');

  for (const entry of ORDER_MAP) {
    const result = await tasks.updateOne(
      { _id: new ObjectId(entry.id) },
      { $set: { order: entry.newOrder } }
    );
    const t = await tasks.findOne({ _id: new ObjectId(entry.id) });
    console.log(`✅ ${entry.id} → order ${entry.newOrder} | "${t.description.substring(0, 45)}..."`);
  }

  console.log('\n========== VERIFICATION ==========\n');

  const verifyTopic = await topics.findOne({ _id: new ObjectId(TOPIC_ID) });
  console.log(`Topic has ${verifyTopic.tasks.length} tasks`);
  console.log(`Task to hide (${TASK_TO_HIDE}) in topic array: ${verifyTopic.tasks.includes(TASK_TO_HIDE) ? '❌ STILL THERE' : '✅ REMOVED'}`);

  const allTasks = await tasks.find({ ref: TOPIC_ID, testMode: { $ne: true } }).sort({ order: 1 }).toArray();
  console.log(`\nActive tasks: ${allTasks.length}`);
  for (const t of allTasks) {
    const testOk = t.requirements.length === t.tests.length ? '✅' : '❌';
    console.log(`  order ${t.order} | ${testOk} reqs:${t.requirements.length} tests:${t.tests.length} | orgCode:${t.orgCode} | "${t.description.substring(0, 50)}..."`);
  }

  // Check hidden task
  const hidden = await tasks.findOne({ _id: new ObjectId(TASK_TO_HIDE) });
  console.log(`\nHidden task: testMode=${hidden.testMode} | order=${hidden.order} | "${hidden.description.substring(0, 50)}..."`);

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
