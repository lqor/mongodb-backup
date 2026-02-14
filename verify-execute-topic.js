const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

async function verify() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('learn-apex');

    // Try both string and ObjectId
    let executeTopic = await db.collection('topics').findOne({ _id: "69693440d331617a8ce8abd6" });
    if (!executeTopic) {
      executeTopic = await db.collection('topics').findOne({ _id: new ObjectId("69693440d331617a8ce8abd6") });
    }

    // Also try searching by name
    if (!executeTopic) {
      console.log("Searching by name...");
      executeTopic = await db.collection('topics').findOne({ topicName: { $regex: /execute method/i } });
    }

    if (executeTopic) {
      console.log("=== EXECUTE METHOD TOPIC ===");
      console.log(JSON.stringify(executeTopic, null, 2));

      if (executeTopic.tasks && executeTopic.tasks.length > 0) {
        console.log("\n=== EXISTING TASKS IN THIS TOPIC ===");
        for (const taskId of executeTopic.tasks) {
          let task = await db.collection('tasks').findOne({ _id: taskId });
          if (!task) task = await db.collection('tasks').findOne({ _id: new ObjectId(taskId) });
          if (task) {
            console.log(`\n  Task: ${task._id}`);
            console.log(`  Description: ${task.description.substring(0, 120)}...`);
            console.log(`  Order: ${task.order}`);
            console.log(`  OrgCode: ${task.orgCode}`);
          }
        }
      }
    } else {
      console.log("Topic not found. Listing all batch-lesson topics...");
      const allTopics = await db.collection('topics').find({
        ref: "6969339bd331617a8ce8abd0"
      }).sort({ order: 1 }).toArray();

      // Also try the lesson ref as ObjectId
      if (allTopics.length === 0) {
        const allTopics2 = await db.collection('topics').find({}).toArray();
        const batchTopics = allTopics2.filter(t =>
          t.topicName && (t.topicName.toLowerCase().includes('batch') ||
          t.topicName.toLowerCase().includes('execute') ||
          t.topicName.toLowerCase().includes('start method'))
        );
        for (const t of batchTopics) {
          console.log(`  ${t._id} | "${t.topicName}" | order: ${t.order} | tasks: ${t.tasks?.length || 0}`);
        }
      } else {
        for (const t of allTopics) {
          console.log(`  ${t._id} | "${t.topicName}" | order: ${t.order} | tasks: ${t.tasks?.length || 0}`);
        }
      }
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
}

verify();
