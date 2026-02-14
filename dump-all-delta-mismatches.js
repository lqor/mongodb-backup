const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const ASYNC_LESSON_IDS = [
  '695ebaa735aada7a8f2f4092',
  '69691b55d331617a8ce8abbb',
  '69692324d331617a8ce8abc4',
  '6969339bd331617a8ce8abd0',
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');
  const topics = db.collection('topics');

  const allTopics = await topics.find({
    ref: { $in: ASYNC_LESSON_IDS }
  }).toArray();

  const topicIds = allTopics.map(t => String(t._id));

  const allTasks = await tasks.find({
    ref: { $in: topicIds },
    testMode: { $ne: true }
  }).toArray();

  const mismatched = [];
  for (const task of allTasks) {
    if (!task.delta || !task.description) continue;
    const deltaText = task.delta[0] && task.delta[0].insert ? task.delta[0].insert.trim() : '';
    if (deltaText !== task.description.trim()) {
      mismatched.push(task);
    }
  }

  console.log(`Found ${mismatched.length} mismatched tasks\n`);

  for (const task of mismatched) {
    const topic = allTopics.find(t => String(t._id) === task.ref);
    const topicName = topic ? topic.topicName : '?';

    console.log('='.repeat(100));
    console.log(`ID: ${task._id}`);
    console.log(`Topic: "${topicName}"`);
    console.log(`Order: ${task.order || '?'}`);

    console.log('\n>>> DESCRIPTION <<<');
    console.log(task.description);

    console.log('\n>>> DELTA <<<');
    console.log(JSON.stringify(task.delta, null, 2));

    console.log('\n');
  }

  await client.close();
}

main().catch(console.error);
