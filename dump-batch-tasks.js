const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

async function dump() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('learn-apex');

    const taskIds = [
      "696ceff3fab54be63ea3d301", // SimpleBatch
      "696ceff3fab54be63ea3d302", // AccountQueryBatch
      "696ceff3fab54be63ea3d303", // ContactFilterBatch
      "696ceff3fab54be63ea3d304", // LeadProcessBatch
      "696ceff3fab54be63ea3d305", // AccountDescriptionBatch
      "696ceff3fab54be63ea3d306", // OpportunityCloseDateBatch
    ];

    for (const id of taskIds) {
      // Try both string and ObjectId
      let task = await db.collection('tasks').findOne({ _id: id });
      if (!task) {
        task = await db.collection('tasks').findOne({ _id: new ObjectId(id) });
      }
      if (task) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`TASK ID: ${task._id}`);
        console.log(`${'='.repeat(80)}`);
        console.log(JSON.stringify(task, null, 2));
      } else {
        console.log(`\nTask ${id} NOT FOUND (tried both string and ObjectId)`);
      }
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
}

dump();
