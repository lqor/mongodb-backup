const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const TOPIC_ID = '6970d58b0a6f66b9d8042fcb';

// Task IDs for tasks 5-20 (all that have String json in tests)
const AFFECTED_TASK_IDS = [
  '697104440a6f66b9d8043021', // task 5
  '697104440a6f66b9d8043022', // task 6
  '697104440a6f66b9d8043023', // task 7
  '697104440a6f66b9d8043024', // task 8
  '697104440a6f66b9d8043025', // task 9
  '697104440a6f66b9d8043026', // task 10
  '697106a20a6f66b9d8043028', // task 11
  '697106a20a6f66b9d8043029', // task 12
  '697106a20a6f66b9d804302a', // task 13
  '697106a20a6f66b9d804302b', // task 14
  '697106a20a6f66b9d804302c', // task 15
  '697106a20a6f66b9d804302d', // task 16
  '697106a20a6f66b9d804302e', // task 17
  '697106a20a6f66b9d804302f', // task 18
  '697106a20a6f66b9d8043030', // task 19
  '697106a20a6f66b9d8043031', // task 20
];

function renameJsonVar(str) {
  // Replace 'String json ' with 'String jsonString '
  // Replace usage of json variable: (json), json;, json,
  // But NOT JSON. (system class) or jsonString, jsonBody etc
  return str
    .replace(/\bString json\b/g, 'String jsonString')
    .replace(/\.extractName\(json\)/g, '.extractName(jsonString)')
    .replace(/\.extractEmail\(json\)/g, '.extractEmail(jsonString)')
    .replace(/\.extractAmount\(json\)/g, '.extractAmount(jsonString)')
    .replace(/\.formatCustomerInfo\(json\)/g, '.formatCustomerInfo(jsonString)')
    .replace(/\.extractLastName\(json\)/g, '.extractLastName(jsonString)')
    .replace(/\.createContactFromJson\(json\)/g, '.createContactFromJson(jsonString)')
    .replace(/\.extractPrice\(json\)/g, '.extractPrice(jsonString)')
    .replace(/\.isInStock\(json\)/g, '.isInStock(jsonString)')
    .replace(/\.hasMiddleName\(json\)/g, '.hasMiddleName(jsonString)')
    .replace(/\.getFirstItem\(json\)/g, '.getFirstItem(jsonString)')
    .replace(/\.countItems\(json\)/g, '.countItems(jsonString)')
    .replace(/\.extractCity\(json\)/g, '.extractCity(jsonString)')
    .replace(/\.extractName\(json\)/g, '.extractName(jsonString)')
    .replace(/\.extractInStock\(json\)/g, '.extractInStock(jsonString)')
    .replace(/\.getInvoiceId\(json\)/g, '.getInvoiceId(jsonString)')
    .replace(/\.getTotal\(json\)/g, '.getTotal(jsonString)')
    .replace(/\.getLineItemCount\(json\)/g, '.getLineItemCount(jsonString)')
    .replace(/\.getEmployeeId\(json\)/g, '.getEmployeeId(jsonString)')
    .replace(/\.getSalary\(json\)/g, '.getSalary(jsonString)')
    .replace(/\.isActive\(json\)/g, '.isActive(jsonString)')
    .replace(/\.hasDepartment\(json\)/g, '.hasDepartment(jsonString)')
    .replace(/\.buildAccount\(json\)/g, '.buildAccount(jsonString)');
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');

  console.log('========== PRE-FLIGHT CHECKS ==========\n');

  const topic = await db.collection('topics').findOne({ _id: new ObjectId(TOPIC_ID) });
  const taskOrder = topic.tasks;

  for (const taskId of AFFECTED_TASK_IDS) {
    const t = await tasks.findOne({ _id: new ObjectId(taskId) });
    if (!t) { console.log(`❌ Task ${taskId} not found!`); await client.close(); return; }
    const idx = taskOrder.indexOf(String(t._id)) + 1;

    // Check tests have 'String json'
    const testsStr = t.tests.join('\n');
    if (!testsStr.includes('String json')) {
      console.log(`⚠️  Task ${idx} (${taskId}): no 'String json' found in tests — skipping`);
      continue;
    }

    // Verify replacement works
    const newTests = t.tests.map(test => renameJsonVar(test));
    for (const test of newTests) {
      if (/\bString json\b/.test(test) || /\(json\)/.test(test)) {
        console.log(`❌ Task ${idx} (${taskId}): replacement incomplete!`);
        console.log('   Remaining: ' + test);
        await client.close();
        return;
      }
    }

    // Verify req/test count unchanged
    if (newTests.length !== t.requirements.length) {
      console.log(`❌ Task ${idx} (${taskId}): test count ${newTests.length} != req count ${t.requirements.length}`);
      await client.close();
      return;
    }

    console.log(`✅ Task ${idx} (${taskId}): ${t.tests.length} tests to fix`);
  }

  console.log(`\n✅ All ${AFFECTED_TASK_IDS.length} tasks validated\n`);

  console.log('========== APPLYING CHANGES ==========\n');

  for (const taskId of AFFECTED_TASK_IDS) {
    const t = await tasks.findOne({ _id: new ObjectId(taskId) });
    const idx = taskOrder.indexOf(String(t._id)) + 1;
    const newTests = t.tests.map(test => renameJsonVar(test));

    const result = await tasks.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { tests: newTests } }
    );
    console.log(result.modifiedCount === 1
      ? `✅ Task ${idx}: updated ${newTests.length} tests (json → jsonString)`
      : `⚠️  Task ${idx}: no change`);
  }

  console.log('\n========== VERIFICATION ==========\n');

  for (const taskId of AFFECTED_TASK_IDS) {
    const t = await tasks.findOne({ _id: new ObjectId(taskId) });
    const idx = taskOrder.indexOf(String(t._id)) + 1;
    const testsStr = t.tests.join('\n');
    const hasOldJson = /\bString json\b/.test(testsStr) || /\(json\)/.test(testsStr);
    const hasNewJson = testsStr.includes('jsonString');
    const reqTestMatch = t.requirements.length === t.tests.length;
    console.log(`  Task ${idx} | old 'json': ${hasOldJson ? '❌ STILL PRESENT' : '✅ removed'} | new 'jsonString': ${hasNewJson ? '✅' : '❌'} | req/test: ${reqTestMatch ? '✅' : '❌'} ${t.requirements.length}/${t.tests.length}`);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
