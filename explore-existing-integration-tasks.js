const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const topics = db.collection('topics');
  const tasks = db.collection('tasks');

  // Get a few topics from the Post Requests lesson to see task style
  const sampleTopics = await topics.find({
    ref: '6970d1c20a6f66b9d8042fbd'
  }).sort({ order: 1 }).limit(3).toArray();

  for (const topic of sampleTopics) {
    console.log(`=== ${topic.topicName} (order ${topic.order}) ===\n`);

    const topicTasks = await tasks.find({
      ref: String(topic._id),
      testMode: { $ne: true }
    }).sort({ order: 1 }).limit(3).toArray();

    for (const task of topicTasks) {
      console.log(`  Task ${task.order}: ${task.description.substring(0, 120)}...`);
      console.log(`    orgCode: ${task.orgCode} | reqs: ${task.requirements.length} | tests: ${task.tests.length} | points: ${task.points}`);
      console.log(`    template: ${task.template ? task.template.substring(0, 80) + '...' : '(empty)'}`);
      console.log(`    preCode: ${task.preCode ? task.preCode.substring(0, 80) + '...' : '(empty)'}`);
      console.log();
    }
  }

  await client.close();
}

main().catch(console.error);
