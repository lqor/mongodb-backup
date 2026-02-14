const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

async function dump() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('learn-apex');

    // The 10 original Execute Method tasks (strings, as stored in the topic)
    const taskIds = [
      "696cf3eafab54be63ea3d309",
      "696cf3eafab54be63ea3d30a",
      "696cf3eafab54be63ea3d30b",
      "696cf3eafab54be63ea3d30c",
      "696cf3eafab54be63ea3d30d",
      "696cf3eafab54be63ea3d30e",
      "696cf3eafab54be63ea3d30f",
      "696cf3eafab54be63ea3d310",
      "696cf3eafab54be63ea3d311",
      "696cf3eafab54be63ea3d312",
    ];

    for (const id of taskIds) {
      const task = await db.collection('tasks').findOne({ _id: new ObjectId(id) });
      if (task) {
        console.log(JSON.stringify(task, null, 2));
        console.log("\n" + "=".repeat(100) + "\n");
      } else {
        console.log(`Task ${id} NOT FOUND\n`);
      }
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
}

dump();
