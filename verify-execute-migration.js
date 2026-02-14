const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

async function verify() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('learn-apex');

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

    console.log("=== VERIFICATION OF 10 EXECUTE METHOD TASKS ===\n");

    for (const id of taskIds) {
      const task = await db.collection('tasks').findOne({ _id: new ObjectId(id) });
      const hasDebug = task.solution.toLowerCase().includes('system.debug');
      const hasCasting = task.solution.includes('(List<');
      console.log(`--- ${task._id} ---`);
      console.log(`  orgCode: ${task.orgCode} ${task.orgCode === true ? '✓' : '✗'}`);
      console.log(`  order: ${task.order}`);
      console.log(`  template: "${task.template.substring(0, 30)}..." ${task.template.startsWith('//') ? '✓' : '✗'}`);
      console.log(`  req=${task.requirements.length}, tests=${task.tests.length} ${task.requirements.length === task.tests.length ? '✓' : '✗'}`);
      console.log(`  System.debug in solution: ${hasDebug ? '✗ YES' : '✓ NO'}`);
      console.log(`  Casting in solution: ${hasCasting ? '✗ YES' : '✓ NO'}`);
      console.log(`  description: "${task.description.substring(0, 70)}..."`);
      console.log();
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
}

verify();
