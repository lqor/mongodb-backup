const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const topics = db.collection('topics');
  const tasks = db.collection('tasks');

  // Get ALL topics from Post Requests lesson, check which have tasks
  const allTopics = await topics.find({
    ref: '6970d1c20a6f66b9d8042fbd'
  }).sort({ order: 1 }).toArray();

  for (const topic of allTopics) {
    const taskCount = await tasks.countDocuments({
      ref: String(topic._id),
      testMode: { $ne: true }
    });

    if (taskCount > 0) {
      console.log(`=== ${topic.topicName} (order ${topic.order}, ${taskCount} tasks) ===\n`);

      const topicTasks = await tasks.find({
        ref: String(topic._id),
        testMode: { $ne: true }
      }).sort({ order: 1 }).limit(5).toArray();

      for (const task of topicTasks) {
        const descLines = task.description.split('\n');
        console.log(`  Task ${task.order} [${task.difficulty}, ${task.points}pts, orgCode:${task.orgCode}]`);
        console.log(`    "${descLines[0]}"`);
        console.log(`    reqs: ${task.requirements.length} | tests: ${task.tests.length}`);
        if (task.preCode) console.log(`    preCode: "${task.preCode.substring(0, 100)}"`);
        if (task.template) console.log(`    template: "${task.template.substring(0, 100)}"`);
        console.log();
      }
    }
  }

  await client.close();
}

main().catch(console.error);
