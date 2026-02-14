const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

async function dump() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('learn-apex');

    // Running a Batch Job topic
    const runningTopic = await db.collection('topics').findOne({ _id: new ObjectId("69693440d331617a8ce8abd7") });
    console.log("=== TOPIC: Running a Batch Job ===");
    console.log(`ID: ${runningTopic._id} | Tasks: ${runningTopic.tasks.length}\n`);

    for (const taskId of runningTopic.tasks) {
      const id = typeof taskId === 'string' ? taskId : taskId.toString();
      const task = await db.collection('tasks').findOne({ _id: new ObjectId(id) });
      if (task) {
        console.log("=" .repeat(100));
        console.log(JSON.stringify(task, null, 2));
        console.log();
      }
    }

    // Batch Apex and Scheduled topic
    const scheduledTopic = await db.collection('topics').findOne({ _id: new ObjectId("69693440d331617a8ce8abd8") });
    console.log("\n=== TOPIC: Batch Apex and Scheduled ===");
    console.log(`ID: ${scheduledTopic._id} | Tasks: ${scheduledTopic.tasks.length}\n`);

    for (const taskId of scheduledTopic.tasks) {
      const id = typeof taskId === 'string' ? taskId : taskId.toString();
      const task = await db.collection('tasks').findOne({ _id: new ObjectId(id) });
      if (task) {
        console.log("=" .repeat(100));
        console.log(JSON.stringify(task, null, 2));
        console.log();
      }
    }

    // Also check Start Method topic since it's in the screenshot
    const startTopic = await db.collection('topics').findOne({ _id: new ObjectId("69693440d331617a8ce8abd5") });
    if (startTopic) {
      console.log("\n=== TOPIC: The Start Method ===");
      console.log(`ID: ${startTopic._id} | Tasks: ${startTopic.tasks.length}\n`);

      for (const taskId of startTopic.tasks) {
        const id = typeof taskId === 'string' ? taskId : taskId.toString();
        const task = await db.collection('tasks').findOne({ _id: new ObjectId(id) });
        if (task) {
          console.log("=" .repeat(100));
          console.log(JSON.stringify(task, null, 2));
          console.log();
        }
      }
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
}

dump();
