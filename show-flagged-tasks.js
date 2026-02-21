const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');

  // Task 3 simple-logging (empty string vs null issue)
  const task3 = await db.collection('tasks').findOne({ _id: new ObjectId('6972364e38f7e59865987e7f') });
  // Task 5 simple-logging (try-catch)
  const task5 = await db.collection('tasks').findOne({ _id: new ObjectId('6972364e38f7e59865987e81') });
  // Task 2 simple-logging (insertedLog from preCode example)
  const task2 = await db.collection('tasks').findOne({ _id: new ObjectId('6972364e38f7e59865987e7e') });

  for (const [label, task] of [['TASK 2 - ErrorLogger (preCode example)', task2], ['TASK 3 - Exception overload (empty string bug)', task3], ['TASK 5 - Try-catch', task5]]) {
    console.log('\n' + '='.repeat(80));
    console.log(label, '| id:', task._id.toString());
    console.log('='.repeat(80));
    console.log('\norgCode:', task.orgCode);
    console.log('order:', task.order);
    console.log('difficulty:', task.difficulty);
    console.log('\n--- DESCRIPTION ---');
    console.log(task.description);
    console.log('\n--- TEMPLATE ---');
    console.log(JSON.stringify(task.template));
    console.log('\n--- PRECODE ---');
    console.log(task.preCode || '(empty)');
    console.log('\n--- SOLUTION ---');
    console.log(task.solution);
    console.log('\n--- REQUIREMENTS (' + task.requirements.length + ') ---');
    task.requirements.forEach((r, i) => console.log(`  [${i}] ${r}`));
    console.log('\n--- TESTS (' + task.tests.length + ') ---');
    task.tests.forEach((t, i) => console.log(`  [${i}] ${t}`));
    console.log('\n--- DELTA ---');
    console.log(JSON.stringify(task.delta));
  }

  await client.close();
}
main().catch(console.error);
