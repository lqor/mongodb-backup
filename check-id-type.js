const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

async function check() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('learn-apex');

    // Check task ID type
    const taskAsString = await db.collection('tasks').findOne({ _id: "696ceff3fab54be63ea3d301" });
    const taskAsObjId = await db.collection('tasks').findOne({ _id: new ObjectId("696ceff3fab54be63ea3d301") });
    console.log("Task found as string:", !!taskAsString);
    console.log("Task found as ObjectId:", !!taskAsObjId);
    if (taskAsObjId) {
      console.log("Task _id type:", typeof taskAsObjId._id, taskAsObjId._id instanceof ObjectId ? "ObjectId" : "not ObjectId");
    }

    // Check topic ID type
    const topicAsString = await db.collection('topics').findOne({ _id: "69693440d331617a8ce8abd4" });
    const topicAsObjId = await db.collection('topics').findOne({ _id: new ObjectId("69693440d331617a8ce8abd4") });
    console.log("\nTopic found as string:", !!topicAsString);
    console.log("Topic found as ObjectId:", !!topicAsObjId);

    // Check what type the ref field is in a task
    if (taskAsObjId) {
      console.log("\nTask ref field value:", taskAsObjId.ref);
      console.log("Task ref field type:", typeof taskAsObjId.ref);
    }

    // Check what type the task IDs are inside the topic's tasks array
    if (topicAsObjId) {
      console.log("\nTopic tasks array first item:", topicAsObjId.tasks[0]);
      console.log("Type:", typeof topicAsObjId.tasks[0]);
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
}

check();
